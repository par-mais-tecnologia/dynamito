/**
 * Dyamo Document of a model, with all operations to manipulate it.
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _util = require('util');

var _dynamito = require('./dynamito.commondocument');

var _dynamito2 = require('./dynamito.core');

var _dynamito3 = _interopRequireDefault(_dynamito2);

var _dynamito4 = require('./dynamito.utils');

var Utils = _interopRequireWildcard(_dynamito4);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Model Document.
 * Operations can be executed over this instance and it will afet this entity.
 *
 * Note: This class can only have functions binded to this. Other atrributes as relative to model class and virtuals.
 */
function Document(rawData, tableName, schema, eventListner) {
  if (!(this instanceof Document)) {
    return new Document(rawData, tableName, schema, eventListner);
  }
  _dynamito.CommonDocument.call(this);

  this.tableName = tableName;
  this.schema = schema;
  this.eventListner = eventListner;

  this.cache = {};

  // Add to this all values incomming values.
  for (var key in rawData) {
    if (rawData.hasOwnProperty(key)) {
      this[key] = rawData[key];
    }
  }

  // Virtuals
  this.applyVirtuals();

  // Methods
  schema.applyMethods(this);
}

// Inherits CommonDocument
(0, _util.inherits)(Document, _dynamito.CommonDocument);

// METHODS
/**
 * Private function to help on save process. This is almost equal creteOne from Commom Document and should become equal.
 * @param inputModel
 * @param callback
 */
function createOne(inputModel, callback) {
  inputModel.shape(inputModel, function () {
    inputModel.schema.validate(inputModel, inputModel, function (validationError) {
      if (validationError) {
        callback(validationError);
      } else {
        // Pre Save Hook.
        inputModel.schema.hook('pre', 'save', inputModel, function (err) {
          if (err) {
            return callback(err);
          }

          _dynamito3.default.table(inputModel.tableName).put(inputModel, inputModel.schema, function (dErr, data) {
            if (dErr) {
              return callback(dErr);
            }

            inputModel.update(data);
            inputModel.eventListner.emit(inputModel.tableName, 'save', inputModel);
            inputModel.schema.hook('post', 'save', inputModel, function (postError) {
              callback(postError, data);
            });
          });
        });
      }
    });
  });
}

Document.prototype.applyDefaults = function () {
  this._applyConfigs(this);
};

Document.prototype.applyVirtuals = function () {
  var virtuals = this.schema.virtualsKeys();
  for (var i = 0; i < virtuals.length; i++) {
    var vp = this.schema.virtualpath(virtuals[i]);
    this[virtuals[i]] = vp.applyGetters(this[virtuals[i]], this);
  }
};

/**
 * Check if a data field is modified.
 */
Document.prototype.isModified = function (field) {
  var keys = this.schema.allKeys();
  if (keys.indexOf(field) === -1) {
    throw new Error('Invalid Field: ' + field);
  }

  return this.cache[field] !== this[field];
};

/**
 * Cache current Fields. They will no more be considered as modified.
 */
Document.prototype.cacheField = function () {
  var keys = this.schema.allKeys();

  for (var k in keys) {
    if (keys.hasOwnProperty(k)) {
      this.cache[keys[k]] = this[keys[k]];
    }
  }
};

/**
 * Convert this document data to json.
 */
Document.prototype.toJSON = function () {
  var keys = this.schema.allKeys();
  var result = {};
  for (var k in keys) {
    if (this[keys[k]] === undefined) {
      continue;
    }

    var serializer = this.schema.path(keys[k]).meta.stringfy;
    var currentData = this[keys[k]];

    if (Array.isArray(currentData)) {
      result[keys[k]] = [];
      for (var cd in currentData) {
        if (currentData.hasOwnProperty(cd)) {
          result[keys[k]].push(serializer(currentData[cd]));
        }
      }
    } else {
      result[keys[k]] = serializer(currentData);
    }
  }
  return result;
};

/**
 * Update all meta data from this entity.
 */
Document.prototype.update = function (data) {
  Utils.extendByAttributes(this, data, this.schema.allKeys());
  this.applyVirtuals();
  this.cacheField();
};

/**
 * Save this entity changes.
 */
Document.prototype.save = function () {
  var self = this;
  return new _bluebird2.default(function (resolve, reject) {
    return _dynamito3.default.check(self.tableName, self.schema, function (err) {
      if (err) {
        return reject(err);
      }

      return createOne(self, function (err, data) {
        if (err) {
          return reject(err);
        }
        Utils.extendByAttributes(self, data, self.schema.allKeys());
        return resolve(self);
      });
    });
  });
};

/**
 * Remove this entity.
 */
Document.prototype.remove = function () {
  var self = this;
  return new _bluebird2.default(function (resolve, reject) {
    _dynamito3.default.table(self.tableName).delete(self, function (err) {
      if (err) {
        reject(err);
      } else {
        self.eventListner.emit(self.tableName, 'remove', self);
        resolve(self);
      }
    });
  });
};

/**
 * Get Key and Value of this Document object.
 */
Document.prototype.keyAndValue = function () {
  var key = this.schema.partitionKey();
  var skey = this.schema.sortkey();

  var result = {};

  var pstr = this.schema.path(key).meta.stringfy;
  result[key] = pstr(this[key]);

  if (skey !== undefined) {
    var rstr = this.schema.path(skey).meta.stringfy;
    result[skey] = rstr(this[skey]);
  }
  return result;
};

exports.default = Document;