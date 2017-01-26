'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateSchemaToDynamo = updateSchemaToDynamo;
exports.updateReturnValues = updateReturnValues;

var _dynamito = require('../../dynamito.utils');

var utils = _interopRequireWildcard(_dynamito);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Create update query.
 */
function updateQuery(schema, query, obj) {
  var keys = schema.allKeys();
  var AttributeUpdates = {};

  for (var i = 0; i < keys.length; i++) {
    if (obj.isModified(keys[i]) && schema.partitionKey() !== keys[i]) {
      AttributeUpdates[keys[i]] = {
        Action: obj[keys[i]] === undefined ? 'ADD' : 'PUT',
        Value: obj[keys[i]]
      };
    }
  }

  utils.merge(query, {
    AttributeUpdates: AttributeUpdates
  });
}

/**
 * Get gey and value of an object in a schema.
 */
/**
 * Update Middlewares.
 */

function keyAndValue(schema, object) {
  var key = schema.partitionKey();
  var result = {};
  result[key] = object[key];
  return result;
}

/**
 * Convert Schema to Dynamo on put operations.
 */
function updateSchemaToDynamo() {
  return function (input, output, schema) {
    output.Key = keyAndValue(schema, input);
    updateQuery(schema, output, input);
    utils.merge(output, input);
  };
}

/**
 * Convert output put operation to output data.
 */
function updateReturnValues() {
  return function (err, result, output /* , schema*/) {
    if (!err) {
      utils.merge(output, result);
    }
  };
}