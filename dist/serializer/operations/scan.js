'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scanSchemaToDynamo = scanSchemaToDynamo;
/**
 * Scan Middlewares.
 */

var utils = require('../../dynamito.utils');

/**
 * Convert Schema to Dynamo on put operations.
 */
function scanSchemaToDynamo() {
  return function (input, output /* , schema*/) {
    utils.merge(output, input);
  };
}