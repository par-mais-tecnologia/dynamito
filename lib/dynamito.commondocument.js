/**
 * Dyamo Common Document, SuperClass of Document and Model.
 */

'use strict';

import eachSeries from 'async/eachSeries';

import Finder from './dynamito.finder';
import * as Utils from './dynamito.utils';

function CommonDocument() {
  if (!(this instanceof CommonDocument)) {
    return new CommonDocument();
  }
}

/**
 * Find an object by an ID.
 */
CommonDocument.prototype.findById = function (hash, range) {
  return new Finder(
    this.tableName,
    this.schema,
    this.eventListner,
    'get', {
      hash: hash,
      range: range
    });
};

/**
 * Scan this table for items.
 */
CommonDocument.prototype.scan = function (options) {
  return new Finder(this.tableName, this.schema, this.eventListner, 'scan', options);
};

/**
 * Search into table with queries.
 */
CommonDocument.prototype.query = function (options) {
  return new Finder(this.tableName, this.schema, this.eventListner, 'query', options);
};

function clone(obj) {
  var copy;

  // Handle the 3 simple types, and null or undefined
  if (null == obj || "object" != typeof obj) return obj;

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      copy[i] = clone(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {};
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
    }
    return copy;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
}

/**
 * Apply input configurations to each attribute.
 * @param input
 * @private
 */
CommonDocument.prototype._applyConfigs = function (input) {
  var iteratedPath = this.schema.path();
  for (var key in iteratedPath) {
    if (iteratedPath.hasOwnProperty(key)) {
      var cPath = this.schema.path(key);

      // LOWERCASE
      if (cPath.lowercase === true) {
        if (typeof input[key] === 'string' || input[key] instanceof String) {
          input[key] = input[key].toLowerCase();
        }
      }

      // DEFAULT
      if (input[key] === undefined && cPath.default !== undefined) {
        input[key] = clone(cPath.default);
      }

      // Adaptable Format: (String -> Number, String => Boolean)
      if (typeof input[key] === 'string') {
        // HERE!
        input[key] = cPath.meta.parse(input[key]);

        // DynamoDb does not accept empty strings. It must be undefined on this case.
        if (input[key] === '') {
          delete input[key];
        }
      }
    }
  }
};

/**
 * Generate a value and check for repeated entities.
 * @private
 */
CommonDocument.prototype._genAndCheck = function (input, currentPath, callback) {
  var self = this;

  var hashName = this.schema.hash.name;
  var rangeName = (this.schema.range === undefined) ? undefined : this.schema.range.name;

  var gen = Utils.generateId();
  input[currentPath.name] = gen;

  var hashValue = input[hashName];
  var rangeValue;
  if (rangeName !== undefined) {
    rangeValue = input[rangeName];
    if (rangeValue === undefined) {
      // IF rangeValue is undefined, it means that this key has not an id yet, so, we don't need to check.
      return callback();
    }
  }

  // Check if generated id is available.
  return this.findById(hashValue, rangeValue)
    .exec()
    .then(data => {
      if (data === null) {
        callback();
      } else {
        // Generate Again
        self._genAndCheck(input, currentPath, callback);
      }
    })
    .catch(callback);
};

/**
 * Apply auto Id on fields.
 * @param input
 * @param next
 * @private
 */
CommonDocument.prototype._applyAutoId = function (input, next) {
  eachSeries(this.schema.path(), (cPath, cb) => {
    // Auto ID - Only if attribute is undefined.
    if (input[cPath.name] === undefined && Utils.getFunctionName(cPath.type) === 'ObjectId') {
      // If is Hash or Range, we will search on database for an entity of this type.
      if (cPath.keyType.isPartition === true || cPath.keyType.isRange) {
        return this._genAndCheck(input, cPath, cb);
      }
    }

    return cb();
  }, next);
};

/**
 * Apply Modifiers, like lowercase and default values.
 *
 * * Lowercase is applied here.
 * * Default values are applied here.
 * * Convert one type into default attribute type.
 * * Crete Auto IDs.
 *
 */
CommonDocument.prototype.shape = function (input, callback) {
  this._applyConfigs(input);
  this._applyAutoId(input, callback);
};

/**
 * Enforce all types from thi document.
 *
 * @example Date in string format will be converted to Date.
 *
 */
CommonDocument.prototype.enforceTypes = function () {
  this._applyConfigs(this);
};

export {CommonDocument};
