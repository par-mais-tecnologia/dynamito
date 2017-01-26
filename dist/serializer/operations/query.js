'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.querySchemaToDynamo = querySchemaToDynamo;
/**
 * Query Middlewares.
 */

var utils = require('../../dynamito.utils');

/**
 * Convert Schema to Dynamo on put operations.
 */
function querySchemaToDynamo() {
  return function (input, output /* , schema*/) {
    utils.merge(output, input);
  };
}