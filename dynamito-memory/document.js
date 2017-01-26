import winston from 'winston';

import process from 'process';

export default function Document() {
  if (Document.Parent === undefined || Document.Parent === null) {
    throw new Error('Document cannot be created without a DynamitoMemory object.');
  }
  this._parent = Document.Parent;
}

Document.prototype._filterField = function (item, fieldsToKeep) {
  var result = {};
  var keys = Object.keys(item);
  keys.forEach(k => {
    if (fieldsToKeep.indexOf(k) !== -1) {
      result[k] = item[k];
    }
  });
  return result;
};

Document.prototype._filterFields = function (items, fieldsToKeep) {
  return items
    .map(it => {
      return this._filterField(it, fieldsToKeep);
    });
};

Document.prototype._projectedFields = function (projected, expressionAttributes) {
  if (projected !== undefined && projected !== '') {
    var fieldsToKeep = projected.split(',');
    return fieldsToKeep.map(it => {
      return expressionAttributes[it.trim()];
    });
  }
  return [];
};

Document.prototype._extractParams = function (params) {
  if (params.length !== 2) {
    return null;
  }

  var paramA = params[0];
  var paramB = params[1];

  if (paramA.indexOf('#') !== -1 && paramB.indexOf(':') !== -1) {
    return {
      name: paramA.trim(),
      value: paramB.trim()
    };
  } else if (paramB.indexOf('#') !== -1 && paramA.indexOf(':') !== -1) {
    return {
      name: paramB.trim(),
      value: paramA.trim()
    };
  }
  return null;
};

Document.prototype._extractFragment = function (text) {
  if (text.indexOf('>=') !== -1) {
    // GTEqual
    var gteq = this._extractParams(text.split('>='));
    gteq.opr = a => {
      return b => {
        return b >= a;
      };
    };
    return gteq;
  } else if (text.indexOf('<=') !== -1) {
    // LTEqual
    var lteq = this._extractParams(text.split('<='));
    lteq.opr = a => {
      return b => {
        return b <= a;
      };
    };
    return lteq;
  } else if (text.indexOf('<') !== -1) {
    // LT
    var lt = this._extractParams(text.split('<'));
    lt.opr = a => {
      return b => {
        return b < a;
      };
    };
    return lt;
  } else if (text.indexOf('>') !== -1) {
    // GT
    var gt = this._extractParams(text.split('>'));
    gt.opr = a => {
      return b => {
        return b > a;
      };
    };
    return gt;
  } else if (text.indexOf('=') !== -1) {
    // Equality
    var eq = this._extractParams(text.split('='));
    eq.opr = a => {
      return b => {
        return a === b;
      };
    };
    return eq;
  }
  return null;
};

Document.prototype._projectedExpression = function (expression, names, values) {
  if (expression === undefined) {
    return [];
  }
  var filters = [];
  var fragments = expression.split('AND');

  for (var i = 0; i < fragments.length; i++) {
    var item = fragments[i];

    // Between check
    if (item.indexOf('BETWEEN') !== -1) {
      var bet = item.split('BETWEEN');
      var next = fragments[i + 1];

      item = bet[0] + '>=' + bet[1];
      fragments[i + 1] = bet[0] + '<=' + next;
    }

    var ext = this._extractFragment(item);
    var over = {
      name: names[ext.name],
      opr: ext.opr(values[ext.value])
    };
    filters.push(over);
  }
  return filters;
};

Document.prototype.scan = function (params, callback) {
  winston.silly('SCAN\'ing: ' + params.TableName);
  winston.silly(params);

  var searchObject = this._projectedExpression(
    params.FilterExpression,
    params.ExpressionAttributeNames,
    params.ExpressionAttributeValues);

  if (!this._parent.db().hasTable(params.TableName)) {
    return callback({
      message: 'Cannot do operations on non-existent table',
      code: 'ResourceNotFoundException',
      time: new Date(Date.now()),
      statusCode: 400,
      retryAble: false
    });
  }

  var items = this._parent.db().query(params.TableName, searchObject);

  // Filter Fields
  var fieldsToKeep = this._projectedFields(params.ProjectionExpression, params.ExpressionAttributeNames);
  if (fieldsToKeep.length > 0) {
    items = this._filterFields(items, fieldsToKeep);
  }

  process.nextTick(callback, null, {
    Items: items
  });
};

/**
 * PUT a new element on database or override an older one.
 * @param params
 * @param callback
 */
Document.prototype.put = function (params, callback) {
  winston.silly('PUT\'ing: ' + params.TableName);
  winston.silly(params);
  this._parent.db().put(params.TableName, params.Item);
  process.nextTick(callback, null);
};

Document.prototype.batchWrite = function (params, callback) {
  var self = this;

  winston.silly('BATCH WRITE\'ing: ');
  winston.silly(params);
  var dataArray = Object.keys(params.RequestItems);
  dataArray.forEach(tab => {
    params.RequestItems[tab].forEach(item => {
      self._parent.db().put(tab, item.PutRequest.Item);
    });
  });
  process.nextTick(callback, null, {
    UnprocessedItems: {}
  });
};

Document.prototype.get = function (params, callback) {
  winston.silly('GET\'ing: ' + params.TableName);
  winston.silly(params);

  var item = this._parent.db().get(params.TableName, params.Key);

  // Filter Fields
  var fieldsToKeep = this._projectedFields(params.ProjectionExpression, params.ExpressionAttributeNames);
  if (fieldsToKeep.length > 0) {
    item = this._filterField(item, fieldsToKeep);
  }

  process.nextTick(callback, null, {
    Item: item
  });
};

Document.prototype.query = function (params, callback) {
  winston.silly('DELETE\'ing: ' + params.TableName);
  winston.silly(params);

  var searchObject = this._projectedExpression(
    params.KeyConditionExpression,
    params.ExpressionAttributeNames,
    params.ExpressionAttributeValues);

  var items = this._parent.db().query(params.TableName, searchObject);

  // Filter Fields
  var fieldsToKeep = this._projectedFields(params.ProjectionExpression, params.ExpressionAttributeNames);
  if (fieldsToKeep.length > 0) {
    items = this._filterFields(items, fieldsToKeep);
  }

  process.nextTick(callback, null, {
    Items: items
  });
};

Document.prototype.delete = function (params, callback) {
  winston.silly('DELETE\'ing: ' + params.TableName);
  winston.silly(params);
  this._parent.db().delete(params.TableName, params.Key);
  process.nextTick(callback, null);
};
