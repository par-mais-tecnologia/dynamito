'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Dynamo model, with all user operations.
 */

var mapSeries = require('async/mapSeries');

var Core = require('./dynamito.core');
var Utils = require('./dynamito.utils');

var validOperations = ['query', 'scan', 'get'];

/**
 * Finder class, to help with find result and queries.
 * @tableName Table name to execute operations.
 * @schema Schema of current model.
 * @eventListner Event listner to manage events.
 *
 */
function Finder(tableName, schema, eventListner, operation, data) {
  this._tableName = tableName;
  this._schema = schema;
  this._populations = [];
  this._eventListner = eventListner;
  this._operation = operation;
  this._data = data;

  /**
   * Queries paramethers on this finder.
   */
  this.paramethers = [];

  /**
   * Fields to be removed from queries.
   */
  this.removedFields = [];
}

/**
 * Private function to remove a single object, and callback.
 */
function remove(object, callback) {
  object.remove().then(function () {
    callback();
  });
}

function findResolver(model, data) {
  if (Array.isArray(data)) {
    var arraysS = [];
    data.forEach(function (it) {
      arraysS.push(model.findById(it).exec());
    });
    return Promise.all(arraysS);
  }
  return model.findById(data).exec();
}

/**
 * Validate an operation
 */
function validateOperation(op) {
  if (validOperations.indexOf(op) === -1) {
    throw new Error('Invalid operation: ' + op);
  }
  return op;
}

/**
 * Instanteate a single object of this model.
 *
 * TODO: This method need a little improvement. It should not require for document like this.
 */
Finder.prototype._instantiateItem = function (item) {
  var Document = require('./dynamito.document').default;
  var inst = new Document(item, this._tableName, this._schema, this._eventListner);
  inst.cacheField();
  return inst;
};

/**
 * Instantiate a list of items.
 */
Finder.prototype._instantiateItems = function (items) {
  var _this = this;

  var result = [];
  items.forEach(function (item) {
    result.push(_this._instantiateItem(item));
  });
  return result;
};

/**
 * Add or remove fields from
 */
Finder.prototype.fields = function (fields) {
  var self = this;
  fields.forEach(function (field) {
    if (field.indexOf('-') === 0) {
      self.removedFields = self.removedFields.concat(field.substr(1, field.length - 1));
    }
  });
  return this;
};

/**
 * Execute root finder option.
 */
Finder.prototype._execute = function () {
  var _this2 = this;

  return new Promise(function (resolve, reject) {
    var queryParams = {};

    for (var i = 0; i < _this2.paramethers.length; i++) {
      _this2.paramethers[i].fill(i, _this2._schema, queryParams);
    }

    // Attributes to get.
    queryParams.Key = _this2._schema.allKeys();
    if (_this2.removedFields.length > 0) {
      var attrToGet = _this2._schema.allKeysFiltered(_this2.removedFields);

      queryParams.ExpressionAttributeNames = queryParams.ExpressionAttributeNames || {};

      var incr = 1;
      attrToGet.forEach(function (it) {
        if (queryParams.ProjectionExpression === undefined) {
          queryParams.ProjectionExpression = '';
        } else {
          queryParams.ProjectionExpression += ', ';
        }
        queryParams.ExpressionAttributeNames['#getattr' + incr] = it;
        queryParams.ProjectionExpression += '#getattr' + incr;

        incr++;
      });
    }

    // Get
    if (_this2._operation === 'get') {
      if (_this2._data === undefined || _this2._data.hash === undefined) {
        throw new Error('Hash is a mandatory search field on this operation.');
      }
      queryParams.hash = _this2._data.hash;
      queryParams.range = _this2._data.range;
    }

    Core.table(_this2._tableName)[validateOperation(_this2._operation)](queryParams, _this2._schema, function (err, result) {
      if (err && err.code === 'ResourceNotFoundException') {
        resolve([]);
      } else if (err) {
        reject(err);
      } else if (result.Items) {
        resolve(_this2._instantiateItems(result.Items));
      } else if (result.Item) {
        resolve(_this2._instantiateItem(result.Item));
      } else if (Utils.isEmptyObject(result)) {
        resolve(null);
      } else if (result.Item === undefined && result.Items === undefined) {
        if (Array.isArray(result)) {
          resolve(_this2._instantiateItems(result));
        } else {
          resolve(_this2._instantiateItem(result));
        }
      } else {
        reject(err);
      }
    });
  });
};

/**
 * Add a Dynamito Filter to this Finder.
 * @note This will only work with 'scan' operation.
 */
Finder.prototype.find = function (filter) {
  if (['scan', 'query'].indexOf(this._operation) === -1) {
    throw new Error('Finder and Filters are only available to "scan" adn "query" operation.');
  }
  if (this._operation === 'scan') {
    filter.setMode(filter.SCAN);
  } else if (this._operation === 'query') {
    filter.setMode(filter.QUERY);
  }
  this.paramethers.push(filter);
  return this;
};

/**
 * Execute current Query and return its data.
 * @note This is an end operation. It will only return a promise.
 */
Finder.prototype.exec = function () {
  var self = this;
  return new Promise(function (resolve, reject) {
    self._execute().then(function (data) {
      return self._execPopulations(data);
    }).then(function (data) {
      resolve(data);
    }).catch(reject);
  });
};

/**
 * Remove all elements on this finder.
 * @note This is an end operation. It will only return a promise.
 */
Finder.prototype.removeAll = function () {
  var self = this;
  return new Promise(function (resolve, reject) {
    self._execute().then(function (data) {
      if (data.length > 0) {
        mapSeries(data, remove, function () {
          resolve();
        });
      } else {
        resolve();
      }
    }).catch(reject);
  });
};

Finder.prototype._execPopulations = function (data) {
  var _this3 = this;

  if (this._populations.length === 0 || data === undefined) {
    return data;
  }
  if (this._operation !== 'get') {
    throw new Error('Canot populate ' + this._operation + ' operation.');
  }

  var pendentPopulations = [];
  this._populations.forEach(function (pop) {
    var cmodel = Core.getModel(pop.path.ref);
    if (cmodel === undefined) {
      throw new Error('Impossible to populate data from: ' + pop.path.ref);
    }
    pendentPopulations.push(findResolver(cmodel, data[pop.path.name]));
  });

  return Promise.all(pendentPopulations).then(function (res) {
    _this3._populations.forEach(function (pop, indx) {
      data[pop.path.name] = res[indx];
    });
    return data;
  });
};

Finder.prototype.populate = function (fieldToPopulate, attributesToFetch) {
  var path = this._schema.path(fieldToPopulate);
  this._populations.push({
    path: path,
    attibutes: attributesToFetch
  });
  return this;
};

exports.default = Finder;