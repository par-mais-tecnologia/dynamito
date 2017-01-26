'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.batchWriteSchemaToDynamo = batchWriteSchemaToDynamo;
exports.posValidation = posValidation;
exports.batchWriteReturnValues = batchWriteReturnValues;

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Convert Schema to Dynamo on put operations.
 */
function batchWriteSchemaToDynamo() {
  return function (input, output /* , schema*/) {
    var table = output.TableName;
    delete output.TableName;

    output.RequestItems = {};
    output.RequestItems[table] = [];

    for (var i = 0; i < input.length; i++) {
      var item = {
        PutRequest: {
          Item: input[i].toJSON()
        }
      };
      output.RequestItems[table].push(item);
    }
  };
} /**
   * BatchWrite Middleware.
   */

function posValidation() {
  function recursiveValidation(document, operation, table, input, result, callback) {
    if (result.UnprocessedItems[table] === undefined) {
      callback(null);
    } else {
      var ri = { RequestItems: {} };
      ri.RequestItems = result.UnprocessedItems;

      setTimeout(function (doc, opr, data) {
        _winston2.default.verbose('Dynamito: Retrying BatchWrite items.');
        doc[opr](data, function (err, result) {
          if (err) {
            callback(err, {});
          } else {
            recursiveValidation(document, operation, table, input, result, callback);
          }
        });
      }, 5000, document, operation, ri);
    }
  }
  return recursiveValidation;
}

/**
 * Convert output put operation to output data.
 */
function batchWriteReturnValues() {
  return function () {};
}