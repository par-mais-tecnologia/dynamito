/**
 * Dyamo Common Document, SuperClass of Document and Model.
 */

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
    'get',
    { hash, range },
    this.options);
};

/**
 * Scan this table for items.
 */
CommonDocument.prototype.scan = function (options) {
  return new Finder(this.tableName, this.schema, this.eventListner, 'scan', options, this.options);
};

/**
 * Search into table with queries.
 */
CommonDocument.prototype.query = function (options) {
  return new Finder(this.tableName, this.schema, this.eventListner, 'query', options, this.options);
};

function clone(obj) {
  let copy;

  // Handle the 3 simple types, and null or undefined
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (let i = 0, len = obj.length; i < len; i += 1) {
      copy[i] = clone(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {};
    for (const attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        copy[attr] = clone(obj[attr]);
      }
    }
    return copy;
  }

  throw new Error('Unable to copy obj! Its type isn\'t supported.');
}

/**
 * Apply input configurations to each attribute.
 * @param input
 * @private
 */
CommonDocument.prototype.applyConfigs = function (input) {
  const iteratedPath = this.schema.path();
  for (const key in iteratedPath) {
    if (iteratedPath.hasOwnProperty(key)) {
      const cPath = this.schema.path(key);

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
CommonDocument.prototype.genAndCheck = function (input, currentPath, callback) {
  const self = this;

  const hashName = this.schema.hash.name;
  const rangeName = (this.schema.range === undefined) ? undefined : this.schema.range.name;

  const gen = Utils.generateId();
  input[currentPath.name] = gen;

  const hashValue = input[hashName];
  let rangeValue;
  if (rangeName !== undefined) {
    rangeValue = input[rangeName];
    if (rangeValue === undefined) {
      // IF rangeValue is undefined
      // , it means that this key has not an id yet, so, we don't need to check.
      return callback();
    }
  }

  // Check if generated id is available.
  return this.findById(hashValue, rangeValue)
    .exec()
    .then((data) => {
      if (data === null) {
        callback();
      } else {
        // Generate Again
        self.genAndCheck(input, currentPath, callback);
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
CommonDocument.prototype.applyAutoId = function (input, next) {
  eachSeries(this.schema.path(), (cPath, cb) => {
    // Auto ID - Only if attribute is undefined.
    if (input[cPath.name] === undefined && Utils.getFunctionName(cPath.type) === 'ObjectId') {
      // If is Hash or Range, we will search on database for an entity of this type.
      if (cPath.keyType.isPartition === true || cPath.keyType.isRange) {
        return this.genAndCheck(input, cPath, cb);
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
  this.applyConfigs(input);
  this.applyAutoId(input, callback);
};

/**
 * Enforce all types from thi document.
 *
 * @example Date in string format will be converted to Date.
 *
 */
CommonDocument.prototype.enforceTypes = function () {
  this.applyConfigs(this);
};

export { CommonDocument };
