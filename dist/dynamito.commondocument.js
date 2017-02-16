/**
 * Dyamo Common Document, SuperClass of Document and Model.
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CommonDocument = undefined;

var _eachSeries = require('async/eachSeries');

var _eachSeries2 = _interopRequireDefault(_eachSeries);

var _dynamito = require('./dynamito.finder');

var _dynamito2 = _interopRequireDefault(_dynamito);

var _dynamito3 = require('./dynamito.utils');

var Utils = _interopRequireWildcard(_dynamito3);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function CommonDocument() {
  if (!(this instanceof CommonDocument)) {
    return new CommonDocument();
  }
}

/**
 * Find an object by an ID.
 */
CommonDocument.prototype.findById = function (hash, range) {
  return new _dynamito2.default(this.tableName, this.schema, this.eventListner, 'get', {
    hash: hash,
    range: range
  });
};

/**
 * Scan this table for items.
 */
CommonDocument.prototype.scan = function () {
  return new _dynamito2.default(this.tableName, this.schema, this.eventListner, 'scan');
};

/**
 * Search into table with queries.
 */
CommonDocument.prototype.query = function () {
  return new _dynamito2.default(this.tableName, this.schema, this.eventListner, 'query');
};

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
        input[key] = cPath.default;
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
  var rangeName = this.schema.range === undefined ? undefined : this.schema.range.name;

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
  return this.findById(hashValue, rangeValue).exec().then(function (data) {
    if (data === null) {
      callback();
    } else {
      // Generate Again
      self._genAndCheck(input, currentPath, callback);
    }
  }).catch(callback);
};

/**
 * Apply auto Id on fields.
 * @param input
 * @param next
 * @private
 */
CommonDocument.prototype._applyAutoId = function (input, next) {
  var _this = this;

  (0, _eachSeries2.default)(this.schema.path(), function (cPath, cb) {
    // Auto ID - Only if attribute is undefined.
    if (input[cPath.name] === undefined && Utils.getFunctionName(cPath.type) === 'ObjectId') {
      // If is Hash or Range, we will search on database for an entity of this type.
      if (cPath.keyType.isPartition === true || cPath.keyType.isRange) {
        return _this._genAndCheck(input, cPath, cb);
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

exports.CommonDocument = CommonDocument;