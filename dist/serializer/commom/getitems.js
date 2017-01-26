'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getArray = getArray;
exports.sortArray = sortArray;
exports.posValidation = posValidation;
exports.getSingle = getSingle;

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _dynamito = require('../../dynamito.utils');

var utils = _interopRequireWildcard(_dynamito);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                     * Scan Middlewares.
                                                                                                                                                                                                     */

/**
 * Convert output put operation to output data.
 */
function getArray() {
  return function (err, result, output /* , schema*/) {
    if (!err) {
      output.data = [];
      utils.merge(output.data, result.Items);
      output.LastEvaluatedKey = result.LastEvaluatedKey;
    }
  };
}

/**
 * Sor an item by RANGE key.
 * @param a
 * @param b
 * @returns {number}
 */
function sortByRange(a, b) {
  if (a > b) {
    return 1;
  } else if (a < b) {
    return -1;
  }
  return 0;
}

function sortArray() {
  return function (err, result, output, schema) {
    if (!err) {
      var prim = schema.partitionKey();
      output.data.sort(function (a, b) {
        if (a[prim] > b[prim]) {
          var secondKeyA = schema.sortkey();
          if (secondKeyA !== undefined) {
            return sortByRange(a[secondKeyA], b[secondKeyA]);
          }
          return 1;
        } else if (a[prim] < b[prim]) {
          var secondKeyB = schema.sortkey();
          if (secondKeyB !== undefined) {
            return sortByRange(a[secondKeyB], b[secondKeyB]);
          }
          return -1;
        }
        return 0;
      });
    }
  };
}

function posValidation() {
  return function recursiveValidation(document, operation, table, input, result, callback) {
    if (result.LastEvaluatedKey === undefined) {
      callback(null);
    } else {
      var ri = {
        TableName: table,
        ExclusiveStartKey: result.UnprocessedItems
      };
      _winston2.default.verbose('Dynamito: Retrying to get next page.');
      document[operation](ri, function (err, recResult) {
        if (err) {
          callback(err, {});
        } else {
          var _result$Items;

          // Append new items to main result object..
          (_result$Items = result.Items).push.apply(_result$Items, _toConsumableArray(recResult.Items));
          recursiveValidation(document, operation, table, input, recResult, callback);
        }
      });
    }
  };
}

/**
 * Convert output of a single item.
 */
function getSingle() {
  return function (err, result, output /* , schema*/) {
    if (!err) {
      output.data = {};
      utils.merge(output.data, result.Item);
    }
  };
}