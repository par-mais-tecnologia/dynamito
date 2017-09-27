/**
 * Class to control restric acces to dynamo documento operations.
 */

import winston from 'winston';

import * as Utils from '../dynamito.utils';

/**
 * Dynamo Document Reference.
 */
let dynamoDocument;

/**
 * Current Execution Scope.
 */
const scope = {
  table: undefined,
};

function posNoop(a, b, c, d, e, next) {
  next();
}

const operations = {
  put: {
    pre: [],
    pos: [],
    posValidation: posNoop,
  },
  update: {
    pre: [],
    pos: [],
    posValidation: posNoop,
  },
  get: {
    pre: [],
    pos: [],
    posValidation: posNoop,
  },
  delete: {
    pre: [],
    pos: [],
    posValidation: posNoop,
  },
  scan: {
    pre: [],
    pos: [],
    posValidation: posNoop,
  },
  query: {
    pre: [],
    pos: [],
    posValidation: posNoop,
  },
  batchWrite: {
    pre: [],
    pos: [],
    posValidation: posNoop,
  },
  // 'batchGet': {
  //   pre: [],
  //   pos: [],
  //   posValidation: posNoop,
  // },
};

/**
 * Parse Dynamo Items
 */
function parseItem(data, schema) {
  const result = {};
  const allKeys = Object.keys(data);
  for (let i = 0; i < allKeys.length; i += 1) {
    const key = allKeys[i];
    if (schema.path(key) !== undefined) {
      const parserFunction = schema.path(key).meta.parse;

      let value;
      if (schema.path(key).array) {
        value = [];
        if (Array.isArray(data[key])) {
          for (let arrInd = 0; arrInd < data[key].length; arrInd += 1) {
            value.push(parserFunction(data[key][arrInd]));
          }
        } else {
          value = data[key];
        }
      } else {
        value = parserFunction(data[key]);
      }

      result[key] = value;
    } else if (schema.additionalProperties === true) {
      result[key] = data[key];
    }
  }
  return result;
}

function posValidation(opr, result, schema, done) {
  return () => {
    if (operations[opr].pos.length === 0) {
      winston.error(`Unhandled Dynamo Pos Operation: ${opr}`);
      throw new Error(`Unhandled Dynamo Pos Operation: ${opr}`);
    }

    const output = {};
    // Apply pos Middleware.
    // Usually middlawares that will change Dynamito Document after any Dynamo operations.
    operations[opr].pos.forEach(out => out(null, result, output, schema));
    // ---

    // ---
    // Return processed params.
    if (output.data === undefined) {
      done(null, output);
    } else {
      // ---
      let parsed;
      if (Array.isArray(output.data)) {
        parsed = [];
        output.data.forEach(it => parsed.push(parseItem(it, schema)));
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
const dynamitoDocument = {};

function createApi(opr) {
  dynamitoDocument[opr] = (params, schema, callback) => {
    if (Utils.isFunction(schema)) {
      callback = schema;
      schema = {};
    }

    if (operations[opr].pre.length === 0) {
      winston.error(`Unhandled Dynamo Pre Operation: ${opr}`);
      throw new Error(`Unhandled Dynamo Pre Operation: ${opr}`);
    }

    // Table name is added to each Dynamo Request.
    const input = {
      TableName: scope.table,
    };

    // Apply pré Middleware.
    // Usually middleware will change Dynamito Document before any Dynamo operations.
    try {
      operations[opr].pre.forEach(middleware => middleware(params, input, schema));
    } catch (err) {
      return callback(err, {});
    }
    // ---

    return dynamoDocument[opr](input, (err, result) => {
      if (err) {
        return callback(err, {});
      }

      return operations[opr]
        .posValidation(dynamoDocument, opr, scope.table, input, result, posValidation(
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
Object.keys(operations).forEach(opr => createApi(opr));

export const initialize = (document) => {
  dynamoDocument = document;
};
export const table = (dynamitoTable) => {
  scope.table = dynamitoTable;
  return dynamitoDocument;
};
// Add a middleware to serializations.
export const addMiddleware = (operation, step, mw) => operations[operation][step].push(mw);
export const setPosValidation = (operation, fn) => {
  operations[operation].posValidation = fn;
};
