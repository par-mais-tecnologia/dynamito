/**
 * Schemas to work with amazon DynamoDb models.
 */

import map from 'async/map';

import VirtualType from './dynamito.virtualtype';
import * as Utils from './dynamito.utils';
import * as validations from './validations/index';
import * as DynamitoTypes from './schema/index';
import createPath from './dynamito.path';

const Hooks = require('./dynamito.hooks');

/**
 * Validat a
 * @param path
 * @param message
 * @returns {function()}
 */
function defaultValidator(path, message) {
  return value => path.validate(value, message);
}

/**
 * Create a DynamoDb Schema.
 Available types:
 'string', 'boolean', 'number'
 */
class Schema {
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
  static Types = DynamitoTypes;

  constructor(data) {
    this.hash = undefined;
    this.range = undefined;

    this.paths = {};
    this.virtuals = {};
    this.methods = {};
    this.hooks = new Hooks();

    // build paths
    if (data) {
      this.add(data);
    }
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
  add(obj, prefix) {
    prefix = prefix || '';
    const keys = Object.keys(obj);

    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i];

      if (obj[key] === null) {
        throw new TypeError(`Invalid value for schema path '${prefix}${key}'`);
      }

      if (Array.isArray(obj[key]) && obj[key].length === 1 && obj[key][0] === null) {
        throw new TypeError(`Invalid value for schema Array path '${prefix}${key}'`);
      }

      // keyType
      if (obj[key].keyType !== undefined) {
        if (obj[key].keyType.isPartition === true) {
          this.setSpecial('hash', key, obj[key]);
        } else if (obj[key].keyType.isRange === true) {
          this.setSpecial('range', key, obj[key]);
        } else {
          throw new Error(`Invalid keyType field: ${obj[key].keyType}`);
        }
      }

      // Standard -> Turn every path into standard format.
      let standardObject;
      if (Utils.isObject(obj[key])) {
        standardObject = obj[key];
      } else {
        standardObject = {
          type: obj[key],
        };
      }

      if (standardObject.ref !== undefined) {
        standardObject.ref = standardObject.ref;
      }

      // Required Field...
      const required = standardObject.required;
      delete standardObject.required;

      // Enum field
      const enField = standardObject.enum;
      delete standardObject.enField;

      // Create Path
      const pathCreator = this.path(key, standardObject);

      // Validation by schema
      if (pathCreator.meta.validations !== undefined) {
        pathCreator.meta.validations.forEach(defaultValidator(pathCreator, `Attributes may not contain an empty string: ${key}`));
      }
      if (pathCreator.keyType !== undefined
        && (pathCreator.keyType.isPartition || pathCreator.keyType.isRange)) {
        pathCreator.keyType.validations.forEach(defaultValidator(pathCreator, `A keys was not given a value: ${key}`));
      }

      // If path has implicit validation, add it here.
      if (required === true) {
        // Required
        pathCreator.validate(validations.required(), `Required field: ${key}`);
        if (pathCreator.array === true) {
          pathCreator.validate(validations.isFilled(), `Required array cannot be empty: ${key}`);
        }
      }
      if (enField !== undefined) {
        if (pathCreator.array === true) {
          pathCreator.validate(validations.validateEnumOnArray(enField, required), `Selected values not in list: ${enField}`);
        } else {
          pathCreator.validate(validations.validateEnum(enField, required), `Value not in list: ${enField}`);
        }
      }
    }

    if (this.hash === undefined) {
      throw new Error('Hash has not been defined.');
    }
  }

  setSpecial(field, key, hash) {
    if (this[field] !== undefined) {
      throw new Error(`More than one ${field} has been defined.`);
    }
    this[field] = {
      name: key,
      key: hash,
    };
  }

  path(key, obj) {
    if (key === undefined && obj === undefined) {
      return this.paths;
    } else if (obj === undefined) {
      return this.paths[key];
    }
    this.paths[key] = createPath(key, obj);
    return this.paths[key];
  }

  /**
   * Get Raw Schema Object
   */
  getObject() {
    return this.paths;
  }

  /**
   * Get all Schemas Keys
   */
  allKeys(includeVirtuals) {
    includeVirtuals = includeVirtuals === undefined ? false : includeVirtuals;

    const result = [];
    for (const key in this.paths) {
      if (this.paths.hasOwnProperty(key)) {
        result.push(key);
      }
    }

    if (includeVirtuals === true) {
      for (const vkey in this.virtuals) {
        if (this.virtuals.hasOwnProperty(vkey)) {
          result.push(vkey);
        }
      }
    }

    return result;
  }

  allKeysFiltered(removedFields) {
    if (removedFields.length === 0) {
      return this.allKeys();
    }

    const result = [];
    for (const key in this.paths) {
      if (removedFields.indexOf(key) === -1) {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * Get this schema partition key.
   */
  partitionKey() {
    for (const key in this.paths) {
      if (this.paths.hasOwnProperty(key)) {
        const keyType = this.paths[key].keyType;
        if (keyType === undefined) {
          continue;
        }

        if (keyType.isPartition === true) {
          return key;
        }
      }
    }
    return undefined;
  }

  /**
   * Get this schema sort key.
   */
  sortkey() {
    for (const key in this.paths) {
      if (this.paths.hasOwnProperty(key)) {
        const keyType = this.paths[key].keyType;
        if (keyType === undefined) {
          continue;
        }

        if (keyType.isRange === true) {
          return key;
        }
      }
    }
    return undefined;
  }

  /**
   * Check if 'at' is a valid field of this schema.
   */
  isField(at) {
    for (const it in this.paths) {
      if (this.paths.hasOwnProperty(it)) {
        if (it === at) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Validate an input against this schema.
   */
  validate(input, model, callback) {
    // To each path
    map(this.paths, (path, cb) => {
      path.doValidation(input, err => cb(err), model);
    }, callback);
  }

  /**
   * Creates a virtual type with the given name.
   */
  virtual(name) {
    const virtuals = this.virtuals;
    virtuals[name] = new VirtualType(name);
    return virtuals[name];
  }

  /**
   * Returns the virtual type with the given `name`.
   *
   * @param {String} name
   * @return {VirtualType}
   */

  virtualpath(name) {
    return this.virtuals[name];
  }

  /**
   * Get Virtual Keys.
   */
  virtualsKeys() {
    const v = [];
    for (const k in this.virtuals) {
      if (this.virtuals.hasOwnProperty(k)) {
        v.push(k);
      }
    }
    return v;
  }

  /**
   * Apply Configured Methods on given object.
   */
  applyMethods(obj) {
    for (const methodName in this.methods) {
      if (this.methods.hasOwnProperty(methodName)) {
        obj[methodName] = this.methods[methodName].bind(obj);
      }
    }
  }

  /**
   * Apply a pre hook.
   */
  pre(condition, callback) {
    this.hooks.pre(condition, callback);
  }

  /**
   * Apply a post hook.
   */
  post(condition, callback) {
    this.hooks.post(condition, callback);
  }

  hook(hook, condition, inputInst, callback) {
    this.hooks.execHook(hook, condition, inputInst, callback);
  }
}

export default Schema;
