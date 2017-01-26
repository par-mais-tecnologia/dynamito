'use strict';

var _util = require('util');

var _mapSeries = require('async/mapSeries');

var _mapSeries2 = _interopRequireDefault(_mapSeries);

var _waterfall = require('async/waterfall');

var _waterfall2 = _interopRequireDefault(_waterfall);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _process = require('process');

var _process2 = _interopRequireDefault(_process);

var _dynamito = require('./dynamito.commondocument');

var _dynamito2 = require('./dynamito.core');

var _dynamito3 = _interopRequireDefault(_dynamito2);

var _dynamito4 = require('./dynamito.document');

var _dynamito5 = _interopRequireDefault(_dynamito4);

var _dynamito6 = require('./dynamito.tables');

var _dynamito7 = require('./dynamito.queries');

var Queries = _interopRequireWildcard(_dynamito7);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Dynamito model class. This class hols all information and params to add elements to a table.
 */
/**
 * Dyamo model, with all user operations.
 */

function Model() {
  _dynamito.CommonDocument.call(this);
}
// Inherits CommonDocument
(0, _util.inherits)(Model, _dynamito.CommonDocument);

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
  var inputInst = new _dynamito5.default(document, this.tableName, this.schema, this.eventListner);
  inputInst.applyDefaults();
  callback(null, inputInst);
};

Model.prototype._preSaveOperations = function (inputData, callback) {
  var _this = this;

  (0, _waterfall2.default)([
  // Check for table and crete on development mode.
  function (next) {
    _process2.default.nextTick(function () {
      _dynamito3.default.check(_this.tableName, _this.schema, function (err) {
        next(err);
      });
    });
  },
  // Shape current data.
  function (next) {
    _process2.default.nextTick(function () {
      _this.shape(inputData, next);
    });
  },
  // Create a document.
  function (next) {
    _process2.default.nextTick(function () {
      _this._createDocument(inputData, next);
    });
  },
  // Validate created document.
  function (document, next) {
    _process2.default.nextTick(function () {
      _this.schema.validate(document, _this, function (err) {
        next(err, document);
      });
    });
  },
  // Apply Pré Save Hook.
  function (document, next) {
    _process2.default.nextTick(function () {
      _this.schema.hook('pre', 'save', document, function (err) {
        next(err, document);
      });
    });
  }], function (err, document) {
    // Return pre validated data or error.
    callback(err, document);
  });
};

Model.prototype._postSaveOperations = function (document, callback) {
  this.eventListner.emit(this.tableName, 'save', document);
  this.schema.hook('post', 'save', document, function (err) {
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
  var _this2 = this;

  (0, _waterfall2.default)([
  // Apply Pré save operation.
  function (next) {
    (0, _mapSeries2.default)(inputData, _this2._preSaveOperations.bind(_this2), next);
  },
  // Save document.
  function (document, next) {
    svFn(document, function (err, saved) {
      next(err, document, saved);
    });
  },
  // Apply post save steps.
  function (document, savedData, next) {
    (0, _mapSeries2.default)(document, _this2._postSaveOperations.bind(_this2), next);
  }], function (err, document) {
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
  var _this3 = this;

  this._savePipe([inputData], function (document, next) {
    _dynamito3.default.table(_this3.tableName).put(document[0], function (err, saved) {
      next(err, document, saved);
    });
  }, function (err, data) {
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
  var _this4 = this;

  this._savePipe(inputData, function (document, next) {
    _dynamito3.default.table(_this4.tableName).batchWrite(document, function (err, saved) {
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
  return new Promise(function (resolve, reject) {
    self._createOne(inputData, function (err, document) {
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
  return new Promise(function (resolve, reject) {
    if (inputData.constructor !== Array) {
      return reject(new Error('Input is not an Array.'));
    }

    self._createMany(inputData, function (err, document) {
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
Model.prototype.createTable = function () {
  var readCapacity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  var writeCapacity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

  var dynSchema = (0, _dynamito6.schemaToDynamoCreationObject)(this.schema);
  dynSchema.ReadCapacityUnits = readCapacity;
  dynSchema.WriteCapacityUnits = writeCapacity;

  var tableData = {
    TableName: _dynamito3.default.modelTrueName(this.tableName),
    KeySchema: dynSchema.keySchema,
    AttributeDefinitions: dynSchema.attributeDefinitions,
    ProvisionedThroughput: dynSchema.provisionedThroughput
  };

  return new Promise(function (resolve, reject) {
    return _dynamito3.default.dynamoDB().createTable(tableData, function (err, data) {
      if (err && err.message !== 'Cannot create preexisting table') {
        _winston2.default.error('Error Creating Tables', tableData, err);
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
    TableName: _dynamito3.default.modelTrueName(this.tableName)
  };
  return new Promise(function (resolve, reject) {
    return _dynamito3.default.dynamoDB().deleteTable(deleteParam, function (err, data) {
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

Model.compile = function (name, schema, base) {
  function model(data) {
    if (!(this instanceof model)) {
      return new model(data); // eslint-disable-line new-cap
    }
    // Inherits Document
    model.prototype.__proto__ = _dynamito5.default.prototype; // eslint-disable-line no-proto
    _dynamito5.default.call(this, data, name, schema, base.eventListner);
  }

  // Inherits Model
  model.__proto__ = Model.prototype; // eslint-disable-line no-proto

  model.tableName = name;
  model.schema = schema;
  model.eventListner = base.eventListner;

  _dynamito3.default.registerModel(model.tableName, model);

  model.Queries = Queries;

  return model;
};

module.exports = Model;