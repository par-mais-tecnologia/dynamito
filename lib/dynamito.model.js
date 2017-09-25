/**
 * Dyamo model, with all user operations.
 */

import {inherits} from 'util';
import mapSeries from 'async/mapSeries';
import waterfall from 'async/waterfall';
import winston from 'winston';
import process from 'process';

import {CommonDocument} from './dynamito.commondocument';
import Core from './dynamito.core';
import Document from './dynamito.document';
import {schemaToDynamoCreationObject} from './dynamito.tables';

import * as Queries from './dynamito.queries';

/**
 * Dynamito model class. This class hols all information and params to add elements to a table.
 */
function Model() {
  CommonDocument.call(this);
}
// Inherits CommonDocument
inherits(Model, CommonDocument);

/**
 * Get current Schema
 */
Model.prototype.getSchema = function () {
  return this.schema;
};

/**
 * Instantiate a single document and return it on callback.
 * @param document
 * @param callback
 * @private
 */
Model.prototype._createDocument = function (document, callback) {
  // Create Document.
  const inputInst = new Document(document, this.tableName, this.schema, this.eventListner, this.options);
  inputInst.applyDefaults();
  callback(null, inputInst);
};

Model.prototype._preSaveOperations = function (inputData, callback) {
  waterfall([
    // Check for table and crete on development mode.
    next => {
      process.nextTick(() => {
        Core.check(this.tableName, this.schema, err => {
          next(err);
        });
      });
    },
    // Shape current data.
    next => {
      process.nextTick(() => {
        this.shape(inputData, next);
      });
    },
    // Create a document.
    next => {
      process.nextTick(() => {
        this._createDocument(inputData, next);
      });
    },
    // Pré validate
    (document, next) => {
      process.nextTick(() => {
        this.schema.hook('pre', 'validate', document, err => {
          next(err, document);
        });
      });
    },
    // Validate created document.
    (document, next) => {
      process.nextTick(() => {
        this.schema.validate(document, this, err => {
          next(err, document);
        });
      });
    },
    // Pós validate
    (document, next) => {
      process.nextTick(() => {
        this.schema.hook('post', 'validate', document, err => {
          next(err, document);
        });
      });
    },
    // Apply Pré Save Hook.
    (document, next) => {
      process.nextTick(() => {
        this.schema.hook('pre', 'save', document, err => {
          next(err, document);
        });
      });
    }
  ], (err, document) => {
    // Return pre validated data or error.
    callback(err, document);
  });
};

Model.prototype._postSaveOperations = function (document, callback) {
  this.eventListner.emit(this.tableName, 'save', document);
  this.schema.hook('post', 'save', document, err => {
    callback(err, document);
  });
};

/**
 * Save pipeline, without save operation, to be set on the course.
 * @param inputData
 * @param svFn Save function.
 * @param callback
 * @private
 */
Model.prototype._savePipe = function (inputData, svFn, callback) {
  waterfall([
    // Apply Pré save operation.
    next => {
      mapSeries(inputData, this._preSaveOperations.bind(this), next);
    },
    // Save document.
    (document, next) => {
      svFn(document, (err, saved) => {
        next(err, document, saved);
      });
    },
    // Apply post save steps.
    (document, savedData, next) => {
      mapSeries(document, this._postSaveOperations.bind(this), next);
    }
  ], (err, document) => {
    callback(err, document);
  });
};

/**
 * Create a Single Object, private.
 * @param inputData
 * @param callback
 * @private
 */
Model.prototype._createOne = function (inputData, callback) {
  this._savePipe([inputData], (document, next) => {
    Core.table(this.tableName).put(document[0], (err, saved) => {
      next(err, document, saved);
    });
  }, (err, data) => {
    callback(err, data[0]);
  });
};

/**
 * Create May Items, private
 * @param inputData
 * @param callback
 * @private
 */
Model.prototype._createMany = function (inputData, callback) {
  this._savePipe(inputData, (document, next) => {
    Core.table(this.tableName).batchWrite(document, (err, saved) => {
      next(err, document, saved);
    });
  }, callback);
};

/**
 * Create a single element.
 * @param inputData
 * @returns {Promise}
 * @note This operation is changing input data.
 */
Model.prototype.createOne = function (inputData) {
  var self = this;
  return new Promise((resolve, reject) => {
    self._createOne(inputData, (err, document) => {
      if (err) {
        return reject(err);
      }
      resolve(document);
    });
  });
};

/**
 * Create many items.
 * @param inputData
 * @returns {Promise}
 * @note This operation is changing input data.
 */
Model.prototype.createMany = function (inputData) {
  var self = this;
  return new Promise((resolve, reject) => {
    if (inputData.constructor !== Array) {
      return reject(new Error('Input is not an Array.'));
    }

    self._createMany(inputData, (err, document) => {
      if (err) {
        return reject(err);
      }
      resolve(document);
    });
  });
};

/**
 * Create a single or multiple elements.
 */
Model.prototype.create = function (input) {
  if (input.constructor === Array) {
    return this.createMany(input);
  }
  return this.createOne(input);
};

/**
 * Create current schema table
 * @param readCapacity Optional read capacity to this operation.
 * @param writeCapacity Optional write capacity to this operation.
 */
Model.prototype.createTable = function (readCapacity = 1, writeCapacity = 1) {
  var dynSchema = schemaToDynamoCreationObject(this.schema);
  dynSchema.ReadCapacityUnits = readCapacity;
  dynSchema.WriteCapacityUnits = writeCapacity;

  var tableData = {
    TableName: Core.modelTrueName(this.tableName),
    KeySchema: dynSchema.keySchema,
    AttributeDefinitions: dynSchema.attributeDefinitions,
    ProvisionedThroughput: dynSchema.provisionedThroughput
  };

  return new Promise((resolve, reject) => {
    return Core.dynamoDB().createTable(tableData, (err, data) => {
      if (err && err.message !== 'Cannot create preexisting table') {
        winston.error('Error Creating Tables', tableData, err);
        reject(err);
      } else {
        resolve(null, 'Created table. Table description JSON: ' + JSON.stringify(data, null, 2));
      }
    });
  });
};

/**
 * Drop table of this model.
 */
Model.prototype.deleteTable = function () {
  var deleteParam = {
    TableName: Core.modelTrueName(this.tableName)
  };
  return new Promise((resolve, reject) => {
    return Core.dynamoDB().deleteTable(deleteParam, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

Model.prototype.on = function (eventname, listner) {
  this.eventListner.on(this.tableName, eventname, listner);
};

Model.compile = function (name, schema, base, options) {
  const opts = {
    additionalProperties: false,
    ...options,
  };
  function model(data) {
    if (!(this instanceof model)) {
      return new model(data);         // eslint-disable-line new-cap
    }
    // Inherits Document
    model.prototype.__proto__ = Document.prototype; // eslint-disable-line no-proto
    Document.call(this, data, name, schema, base.eventListner, opts);
  }

  // Inherits Model
  model.__proto__ = Model.prototype;                // eslint-disable-line no-proto

  model.tableName = name;
  model.schema = schema;
  model.eventListner = base.eventListner;
  model.options = opts;

  Core.registerModel(model.tableName, model);

  model.Queries = Queries;

  return model;
};

module.exports = Model;
