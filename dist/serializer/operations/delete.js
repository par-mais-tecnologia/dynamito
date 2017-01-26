'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deleteSchemaToDynamo = deleteSchemaToDynamo;
exports.deleteReturnValues = deleteReturnValues;

var _dynamito = require('../../dynamito.utils');

var Utils = _interopRequireWildcard(_dynamito);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Convert Schema to Dynamo on put operations.
 */
function deleteSchemaToDynamo() {
  return function (input, output /* , schema*/) {
    Utils.merge(output, {
      Key: input.keyAndValue()
    });
  };
}

/**
 * Convert output put operation to output data.
 */
/**
 * Delete Middlewares.
 */

function deleteReturnValues() {
  return function (err, result, output /* , schema*/) {
    if (!err) {
      Utils.merge(output, result);
    }
  };
}