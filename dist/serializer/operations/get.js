"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSchemaToDynamo = getSchemaToDynamo;
/**
 * Put Middlewares.
 */

/**
 * Convert Schema to Dynamo on put operations.
 */
function getSchemaToDynamo() {
  return function (input, output, schema) {
    var hash = input.hash;
    var range = input.range;

    var key = schema.partitionKey();
    var skey = schema.sortkey();
    var s = {};
    s[key] = hash;
    if (skey !== undefined) {
      s[skey] = range;
    }
    output.Key = s;
    output.ExpressionAttributeNames = input.ExpressionAttributeNames;
    output.ProjectionExpression = input.ProjectionExpression;
  };
}