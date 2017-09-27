/**
 * Dynamo model, with all user operations.
 */

import mapSeries from 'async/mapSeries';

import * as Core from './dynamito.core';
import { Query } from './dynamito.queries';

import * as Utils from './dynamito.utils';

const validOperations = [
  'query',
  'scan',
  'get',
];

/**
 * Finder class, to help with find result and queries.
 * @tableName Table name to execute operations.
 * @schema Schema of current model.
 * @eventListner Event listner to manage events.
 *
 */
function Finder(tableName, schema, eventListner, operation, data = {}, options = {}) {
  this.tableName = tableName;
  this.schema = schema;
  this.populations = [];
  this.eventListner = eventListner;
  this.operation = operation;
  this.data = data;
  this.options = options;

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
  object.remove().then(() => {
    callback();
  });
}

function findResolver(model, data) {
  if (Array.isArray(data)) {
    const arraysS = [];
    data.forEach(it => arraysS.push(model.findById(it).exec()));
    return Promise.all(arraysS);
  }
  return model.findById(data).exec();
}

/**
 * Validate an operation
 */
function validateOperation(op) {
  if (validOperations.indexOf(op) === -1) {
    throw new Error(`Invalid operation: ${op}`);
  }
  return op;
}

/**
 * Instanteate a single object of this model.
 *
 * TODO: This method need a little improvement. It should not require for document like this.
 */
Finder.prototype.instantiateItemPrivate = function (item) {
  const Document = require('./dynamito.document').default;
  const inst = new Document(item, this.tableName, this.schema, this.eventListner, this.options);
  inst.cacheField();
  return inst;
};

/**
 * Instantiate a list of items.
 */
Finder.prototype.instantiateItemPrivates = function (items) {
  const result = [];
  items.forEach(item => result.push(this.instantiateItemPrivate(item)));
  return result;
};

/**
 * Add or remove fields from
 */
Finder.prototype.fields = function (fields) {
  const self = this;
  fields.forEach((field) => {
    if (field.indexOf('-') === 0) {
      self.removedFields = self.removedFields.concat(field.substr(1, field.length - 1));
    }
  });
  return this;
};

/**
 * Execute root finder option.
 */
Finder.prototype.executePrivate = function () {
  return new Promise((resolve, reject) => {
    const queryParams = {};

    for (let i = 0; i < this.paramethers.length; i += 1) {
      this.paramethers[i].fill(i, this.schema, queryParams);
    }

    // Attributes to get.
    // queryParams.Key = this.schema.allKeys();
    if (this.removedFields.length > 0) {
      const attrToGet = this.schema.allKeysFiltered(this.removedFields);

      queryParams.ExpressionAttributeNames = queryParams.ExpressionAttributeNames || {};

      let incr = 1;
      attrToGet.forEach((it) => {
        if (queryParams.ProjectionExpression === undefined) {
          queryParams.ProjectionExpression = '';
        } else {
          queryParams.ProjectionExpression += ', ';
        }
        queryParams.ExpressionAttributeNames[`#getattr${incr}`] = it;
        queryParams.ProjectionExpression += `#getattr${incr}`;

        incr += 1;
      });
    }

    // Get
    if (this.operation === 'get') {
      if (this.data === undefined || this.data.hash === undefined) {
        throw new Error('Hash is a mandatory search field on this operation.');
      }
      queryParams.hash = this.data.hash;
      queryParams.range = this.data.range;
    }

    // With secondary index
    if (this.data.index !== undefined) {
      queryParams.IndexName = this.data.index;
    }

    // Multi Thread Operation
    if (this.data.threads !== undefined) {
      queryParams.TotalSegments = this.data.threads;
      queryParams.Segment = this.data.segment;
    }

    const valOpr = validateOperation(this.operation);
    Core.table(this.tableName)[valOpr](queryParams, this.schema, (err, result) => {
      if (err && err.code === 'ResourceNotFoundException') {
        resolve([]);
      } else if (err) {
        reject(err);
      } else if (result.Items) {
        resolve(this.instantiateItemPrivates(result.Items));
      } else if (result.Item) {
        resolve(this.instantiateItemPrivate(result.Item));
      } else if (Utils.isEmptyObject(result)) {
        resolve(null);
      } else if (result.Item === undefined && result.Items === undefined) {
        if (Array.isArray(result)) {
          resolve(this.instantiateItemPrivates(result));
        } else {
          resolve(this.instantiateItemPrivate(result));
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
  if (['scan', 'query'].indexOf(this.operation) === -1) {
    throw new Error('Finder and Filters are only available to "scan" adn "query" operation.');
  }
  if (this.operation === 'scan') {
    filter.setMode(Query.SCAN);
  } else if (this.operation === 'query') {
    filter.setMode(Query.QUERY);
  }
  this.paramethers.push(filter);
  return this;
};

/**
 * Execute current Query and return its data.
 * @note This is an end operation. It will only return a promise.
 */
Finder.prototype.exec = function () {
  const self = this;
  return new Promise((resolve, reject) => {
    self.executePrivate()
      .then(data => self.execPopulations(data))
      .then(data => resolve(data))
      .catch(reject);
  });
};

/**
 * Remove all elements on this finder.
 * @note This is an end operation. It will only return a promise.
 */
Finder.prototype.removeAll = function () {
  const self = this;
  return new Promise((resolve, reject) => {
    self.executePrivate()
      .then((data) => {
        if (data.length > 0) {
          mapSeries(data, remove, () => resolve());
        } else {
          resolve();
        }
        return null;
      })
      .catch(reject);
  });
};

Finder.prototype.execPopulations = function (data) {
  if (this.populations.length === 0 || data === undefined) {
    return data;
  }
  if (this.operation !== 'get') {
    throw new Error(`Canot populate ${this.operation} operation.`);
  }

  const pendentPopulations = [];
  this.populations.forEach((pop) => {
    const cmodel = Core.getModel(pop.path.ref);
    if (cmodel === undefined) {
      throw new Error(`Impossible to populate data from: ${pop.path.ref}`);
    }
    pendentPopulations.push(findResolver(cmodel, data[pop.path.name]));
  });

  return Promise
    .all(pendentPopulations)
    .then((res) => {
      this.populations.forEach((pop, indx) => {
        data[pop.path.name] = res[indx];
      });
      return data;
    });
};

Finder.prototype.populate = function (fieldToPopulate, attributesToFetch) {
  const path = this.schema.path(fieldToPopulate);
  this.populations.push({
    path,
    attibutes: attributesToFetch,
  });
  return this;
};

export default Finder;
