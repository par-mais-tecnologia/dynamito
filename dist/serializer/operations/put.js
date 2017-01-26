"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.putSchemaToDynamo = putSchemaToDynamo;
exports.putReturnValues = putReturnValues;
/**
 * Put Middlewares.
 */

/**
 * Convert Schema to Dynamo on put operations.
 */
function putSchemaToDynamo() {
  return function (input, output /* , schema*/) {
    output.Item = input.toJSON();
  };
}

/**
 * Convert output put operation to output data.
 */
function putReturnValues() {
  return function () {};
}