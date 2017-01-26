"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.batchGetSchemaToDynamo = batchGetSchemaToDynamo;
exports.batchGetReturnValues = batchGetReturnValues;
exports.batchGetPosValidation = batchGetPosValidation;
function batchGetSchemaToDynamo() {
  return function (input, output, schema) {
    var table = output.TableName;
    var key = input.Key;
    delete output.TableName;

    var keys = [schema.partitionKey()];
    if (schema.sortkey() !== undefined) {
      keys.push(schema.sortkey());
    }

    output.RequestItems = {};
    output.RequestItems[table] = {
      AttributesToGet: key,
      Keys: keys
    };
  };
}

function batchGetReturnValues() {
  return function () {};
}

function batchGetPosValidation() {
  function recursiveValidation(document, operation, table, input, result, callback) {
    callback(null);
  }
  return recursiveValidation;
}