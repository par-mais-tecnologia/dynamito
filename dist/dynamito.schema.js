/**
 * Schemas to work with amazon DynamoDb models.
 */

'use strict';

var _validations = require('./validations');

var validations = _interopRequireWildcard(_validations);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var Utils = require('./dynamito.utils');
var VirtualType = require('./dynamito.virtualtype');
var Path = require('./dynamito.path');
var Hooks = require('./dynamito.hooks');
var DynamitoTypes = require('./schema/index');

var map = require('async/map');

/**
 * Create a DynamoDb Schema.
    Available types:
      'string', 'boolean', 'number'

keyType:
'HASH' or 'RANGE' (default: RANGE)

 */
function Schema(obj) {
  if (!(this instanceof Schema)) {
    return new Schema(obj);
  }

  this.hash = undefined;
  this.range = undefined;

  this.paths = {};
  this.virtuals = {};
  this.methods = {};
  this.hooks = new Hooks();

  // build paths
  if (obj) {
    this.add(obj);
  }
}

/**
 *
 * The various built-in Dynamito Schema Types
 *
 * - [String](#schema-string-js)
 * - [Number](#schema-number-js)
 * - [Boolean](#schema-boolean-js) | Bool
 * - [Date](#schema-date-js)
 * - [Object](#schema-mixed-js)
 * - [HASH](#schema-hash-js) | Hash
 * - [RANGE](#schema-range-js) | Range
 *
 */
Schema.Types = DynamitoTypes;

/**
 * Validat a
 * @param path
 * @param message
 * @returns {function()}
 */
function defaultValidator(path, message) {
  return function (value) {
    path.validate(value, message);
  };
}

/**
 * Adds key path / schema type pairs to this schema.
 *
 * ####Example:
 *
 *     var ToySchema = new Schema;
 *     ToySchema.add({ name: 'string', color: 'string', price: 'number' });
 *
 * @param {Object} obj
 * @param {String} prefix -> Not used yet.
 */
Schema.prototype.add = function (obj, prefix) {
  prefix = prefix || '';
  var keys = Object.keys(obj);

  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i];

    if (obj[key] === null) {
      throw new TypeError('Invalid value for schema path `' + prefix + key + '`');
    }

    if (Array.isArray(obj[key]) && obj[key].length === 1 && obj[key][0] === null) {
      throw new TypeError('Invalid value for schema Array path `' + prefix + key + '`');
    }

    // keyType
    if (obj[key].keyType !== undefined) {
      if (obj[key].keyType.isPartition === true) {
        this.setSpecial('hash', key, obj[key]);
      } else if (obj[key].keyType.isRange === true) {
        this.setSpecial('range', key, obj[key]);
      } else {
        var message = 'Invalid keyType field: ' + obj[key].keyType;
        throw new Error(message);
      }
    }

    // Standard -> Turn every path into standard format.
    var standardObject;
    if (Utils.isObject(obj[key])) {
      standardObject = obj[key];
    } else {
      standardObject = {
        type: obj[key]
      };
    }

    if (standardObject.ref !== undefined) {
      standardObject.ref = standardObject.ref;
    }

    // Required Field...
    var required = standardObject.required;
    delete standardObject.required;

    // Enum field
    var enField = standardObject.enum;
    delete standardObject.enField;

    // Create Path
    var createPath = this.path(key, standardObject);

    // Validation by schema
    if (createPath.meta.validations !== undefined) {
      createPath.meta.validations.forEach(defaultValidator(createPath, 'Attributes may not contain an empty string: ' + key));
    }
    if (createPath.keyType !== undefined && (createPath.keyType.isPartition || createPath.keyType.isRange)) {
      createPath.keyType.validations.forEach(defaultValidator(createPath, 'A keys was not given a value: ' + key));
    }

    // If path has implicit validation, add it here.
    if (required === true) {
      // Required
      createPath.validate(validations.required(), 'Required field: ' + key);
      if (createPath.array === true) {
        createPath.validate(validations.isFilled(), 'Required array cannot be empty: ' + key);
      }
    }
    if (enField !== undefined) {
      if (createPath.array === true) {
        createPath.validate(validations.validateEnumOnArray(enField, required), 'Selected values not in list: ' + enField);
      } else {
        createPath.validate(validations.validateEnum(enField, required), 'Value not in list: ' + enField);
      }
    }
  }

  if (this.hash === undefined) {
    throw new Error('Hash has not been defined.');
  }
};

Schema.prototype.setSpecial = function (field, key, hash) {
  if (this[field] !== undefined) {
    throw new Error('More than one ' + field + ' has been defined.');
  }
  this[field] = {
    name: key,
    key: hash
  };
};

Schema.prototype.path = function (key, obj) {
  if (key === undefined && obj === undefined) {
    return this.paths;
  } else if (obj === undefined) {
    return this.paths[key];
  }
  this.paths[key] = Path.createPath(key, obj);
  return this.paths[key];
};

/**
 * Get Raw Schema Object
 */
Schema.prototype.getObject = function () {
  return this.paths;
};

/**
 * Get all Schemas Keys
 */
Schema.prototype.allKeys = function (includeVirtuals) {
  includeVirtuals = includeVirtuals === undefined ? false : includeVirtuals;

  var result = [];
  for (var key in this.paths) {
    if (this.paths.hasOwnProperty(key)) {
      result.push(key);
    }
  }

  if (includeVirtuals === true) {
    for (var vkey in this.virtuals) {
      if (this.virtuals.hasOwnProperty(vkey)) {
        result.push(vkey);
      }
    }
  }

  return result;
};

Schema.prototype.allKeysFiltered = function (removedFields) {
  if (removedFields.length === 0) {
    return this.allKeys();
  }

  var result = [];
  for (var key in this.paths) {
    if (removedFields.indexOf(key) === -1) {
      result.push(key);
    }
  }
  return result;
};

/**
 * Get this schema partition key.
 */
Schema.prototype.partitionKey = function () {
  for (var key in this.paths) {
    if (this.paths.hasOwnProperty(key)) {
      var keyType = this.paths[key].keyType;
      if (keyType === undefined) {
        continue;
      }

      if (keyType.isPartition === true) {
        return key;
      }
    }
  }
};

/**
 * Get this schema sort key.
 */
Schema.prototype.sortkey = function () {
  for (var key in this.paths) {
    if (this.paths.hasOwnProperty(key)) {
      var keyType = this.paths[key].keyType;
      if (keyType === undefined) {
        continue;
      }

      if (keyType.isRange === true) {
        return key;
      }
    }
  }
  return undefined;
};

/**
 * Check if 'at' is a valid field of this schema.
 */
Schema.prototype.isField = function (at) {
  for (var it in this.paths) {
    if (this.paths.hasOwnProperty(it)) {
      if (it === at) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Validate an input against this schema.
 */
Schema.prototype.validate = function (input, model, callback) {
  // To each path
  map(this.paths, function (path, cb) {
    path.doValidation(input, function (err) {
      cb(err);
    }, model);
  }, callback);
};

/**
 * Creates a virtual type with the given name.
 */
Schema.prototype.virtual = function (name) {
  var virtuals = this.virtuals;
  virtuals[name] = new VirtualType(name);
  return virtuals[name];
};

/**
 * Returns the virtual type with the given `name`.
 *
 * @param {String} name
 * @return {VirtualType}
 */

Schema.prototype.virtualpath = function (name) {
  return this.virtuals[name];
};

/**
 * Get Virtual Keys.
 */
Schema.prototype.virtualsKeys = function () {
  var v = [];
  for (var k in this.virtuals) {
    if (this.virtuals.hasOwnProperty(k)) {
      v.push(k);
    }
  }
  return v;
};

/**
 * Apply Configured Methods on given object.
 */
Schema.prototype.applyMethods = function (obj) {
  for (var methodName in this.methods) {
    if (this.methods.hasOwnProperty(methodName)) {
      obj[methodName] = this.methods[methodName].bind(obj);
    }
  }
};

/**
 * Apply a pre hook.
 */
Schema.prototype.pre = function (condition, callback) {
  this.hooks.pre(condition, callback);
};

/**
 * Apply a post hook.
 */
Schema.prototype.post = function (condition, callback) {
  this.hooks.post(condition, callback);
};

Schema.prototype.hook = function (hook, condition, inputInst, callback) {
  this.hooks.execHook(hook, condition, inputInst, callback);
};

module.exports = Schema;