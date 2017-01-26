/**
 * Class to control restric acces to dynamo documento operations.
 */

'use strict';

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _dynamito = require('../dynamito.utils');

var Utils = _interopRequireWildcard(_dynamito);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Dynamo Document Reference.
 */
var dynamoDocument;

/**
 * Current Execution Scope.
 */
var scope = {
  table: undefined
};

function posNoop(a, b, c, d, e, next) {
  next();
}

var operations = {
  put: {
    pre: [],
    pos: [],
    posValidation: posNoop
  },
  update: {
    pre: [],
    pos: [],
    posValidation: posNoop
  },
  get: {
    pre: [],
    pos: [],
    posValidation: posNoop
  },
  delete: {
    pre: [],
    pos: [],
    posValidation: posNoop
  },
  scan: {
    pre: [],
    pos: [],
    posValidation: posNoop
  },
  query: {
    pre: [],
    pos: [],
    posValidation: posNoop
  },
  batchWrite: {
    pre: [],
    pos: [],
    posValidation: posNoop
  }
  // 'batchGet': {
  //   pre: [],
  //   pos: [],
  //   posValidation: posNoop
  // }
};

/**
 * Parse Dynamo Items
 */
function parseItem(data, schema) {
  var result = {};
  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      if (schema.path(key) === undefined) {
        // Probably a removed field.
        continue;
      }

      var parserFunction = schema.path(key).meta.parse;

      var value;
      if (schema.path(key).array) {
        value = [];
        if (Array.isArray(data[key])) {
          for (var i = 0; i < data[key].length; i++) {
            value.push(parserFunction(data[key][i]));
          }
        } else {
          value = data[key];
        }
      } else {
        value = parserFunction(data[key]);
      }

      result[key] = value;
    }
  }
  return result;
}

function posValidation(opr, result, schema, done) {
  return function () {
    if (operations[opr].pos.length === 0) {
      _winston2.default.error('Unhandled Dynamo Pos Operation: ' + opr);
      throw new Error('Unhandled Dynamo Pos Operation: ' + opr);
    }

    var output = {};
    // Apply pos Middleware. Usually middlawares that will change Dynamito Document befer any Dynamo operations.
    operations[opr].pos.forEach(function (out) {
      out(null, result, output, schema);
    });
    // ---

    // ---
    // Return processed params.
    if (output.data === undefined) {
      done(null, output);
    } else {
      // ---
      var parsed;
      if (Array.isArray(output.data)) {
        parsed = [];
        output.data.forEach(function (it) {
          parsed.push(parseItem(it, schema));
        });
      } else {
        // ---
        parsed = parseItem(output.data, schema);
      }
      // ---
      done(null, parsed);
    }
    // ---
  };
}

/**
 * DynamoDb Public document on Dynamito application.
 * All operations are created dynamically.
 */
var dynamitoDocument = {};

function createApi(opr) {
  dynamitoDocument[opr] = function (params, schema, callback) {
    if (Utils.isFunction(schema)) {
      callback = schema;
      schema = {};
    }

    if (operations[opr].pre.length === 0) {
      _winston2.default.error('Unhandled Dynamo Pre Operation: ' + opr);
      throw new Error('Unhandled Dynamo Pre Operation: ' + opr);
    }

    // Table name is added to each Dynamo Request.
    var input = {
      TableName: scope.table
    };

    // Apply pré Middleware. Usually middleware will change Dynamito Document before any Dynamo operations.
    try {
      operations[opr].pre.forEach(function (it) {
        it(params, input, schema);
      });
    } catch (err) {
      return callback(err, {});
    }
    // ---

    dynamoDocument[opr](input, function (err, result) {
      if (err) {
        return callback(err, {});
      }

      operations[opr].posValidation(dynamoDocument, opr, scope.table, input, result, posValidation(opr, result, schema, callback));
    });
  };
}

/**
 * Create each dynamo operation.
 */
for (var opr in operations) {
  if (operations.hasOwnProperty(opr)) {
    createApi(opr);
  }
}

module.exports = {
  initialize: function initialize(d) {
    dynamoDocument = d;
  },
  table: function table(_table) {
    scope.table = _table;
    return dynamitoDocument;
  },
  // Add a middlewar to serializations.
  addMiddleware: function addMiddleware(operation, step, mw) {
    operations[operation][step].push(mw);
  },
  setPosValidation: function setPosValidation(operation, fn) {
    operations[operation].posValidation = fn;
  }
};