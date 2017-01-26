/**
 * Class to control restric acces to dynamo documento operations.
 */

'use strict';

import winston from 'winston';

import * as Utils from '../dynamito.utils';

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
  return () => {
    if (operations[opr].pos.length === 0) {
      winston.error('Unhandled Dynamo Pos Operation: ' + opr);
      throw new Error('Unhandled Dynamo Pos Operation: ' + opr);
    }

    var output = {};
    // Apply pos Middleware. Usually middlawares that will change Dynamito Document befer any Dynamo operations.
    operations[opr].pos.forEach(out => {
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
  dynamitoDocument[opr] = (params, schema, callback) => {
    if (Utils.isFunction(schema)) {
      callback = schema;
      schema = {};
    }

    if (operations[opr].pre.length === 0) {
      winston.error('Unhandled Dynamo Pre Operation: ' + opr);
      throw new Error('Unhandled Dynamo Pre Operation: ' + opr);
    }

    // Table name is added to each Dynamo Request.
    var input = {
      TableName: scope.table
    };

    // Apply pré Middleware. Usually middleware will change Dynamito Document before any Dynamo operations.
    try {
      operations[opr].pre.forEach(it => {
        it(params, input, schema);
      });
    } catch (err) {
      return callback(err, {});
    }
    // ---

    dynamoDocument[opr](input, (err, result) => {
      if (err) {
        return callback(err, {});
      }

      operations[opr].posValidation(dynamoDocument, opr, scope.table, input, result, posValidation(
        opr,
        result,
        schema,
        callback));
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
  initialize: d => {
    dynamoDocument = d;
  },
  table: table => {
    scope.table = table;
    return dynamitoDocument;
  },
  // Add a middlewar to serializations.
  addMiddleware: (operation, step, mw) => {
    operations[operation][step].push(mw);
  },
  setPosValidation: (operation, fn) => {
    operations[operation].posValidation = fn;
  }
};
