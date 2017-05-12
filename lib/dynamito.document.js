/**
 * Dyamo Document of a model, with all operations to manipulate it.
 */

'use strict';

import Promise from 'bluebird';
import { inherits } from 'util';
import waterfall from 'async/waterfall';
import process from 'process';

import { CommonDocument } from './dynamito.commondocument';
import Core from './dynamito.core';
import * as Utils from './dynamito.utils';

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
  CommonDocument.call(this);

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
inherits(Document, CommonDocument);

// METHODS
/**
 * Private function to help on save process. This is almost equal creteOne from Commom Document and should become equal.
 * @param inputModel
 * @param callback
 */
function createOne(inputModel, callback) {
  waterfall([
    // Shape input data.
    (next) => {
      process.nextTick(() => {
        inputModel.shape(inputModel, () => {
          next();
        });
      })
    },
    // Pré validate
    (next) => {
      process.nextTick(() => {
        inputModel.schema.hook('pre', 'validate', inputModel, err => {
          next(err);
        });
      });
    },
    // Validate input dta
    (next) => {
      process.nextTick(() => {
        inputModel.schema.validate(inputModel, inputModel, validationError => next(validationError));
      });
    },
    // Pós validate
    (next) => {
      process.nextTick(() => {
        inputModel.schema.hook('post', 'validate', inputModel, err => {
          next(err);
        });
      });
    },
    // Pré Save
    (next) => {
      process.nextTick(() => {
        inputModel.schema.hook('pre', 'save', inputModel, err => {
          next(err);
        });
      });
    },
    (next) => {
      process.nextTick(() => {
        Core.table(inputModel.tableName).put(inputModel, inputModel.schema, (dErr, data) => next(dErr, data));
      });
    },
    (data, next) => {
      process.nextTick(() => {
        inputModel.update(data);
        inputModel.eventListner.emit(inputModel.tableName, 'save', inputModel);
        inputModel.schema.hook('post', 'save', inputModel, postError => {
          next(postError, data);
        });
      });
    }
  ], (err, resData) => {
    // Return pre validated data or error.
    callback(err, resData);
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
  return new Promise((resolve, reject) => {
    return Core.check(self.tableName, self.schema, err => {
      if (err) {
        return reject(err);
      }

      return createOne(self, (err, data) => {
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
  return new Promise((resolve, reject) => {
    Core.table(self.tableName).delete(self, err => {
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

export default Document;
