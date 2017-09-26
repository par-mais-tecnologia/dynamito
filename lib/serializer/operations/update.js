/**
 * Update Middlewares.
 */

import * as utils from '../../dynamito.utils';

/**
 * Create update query.
 */
function updateQuery(schema, query, obj) {
  const keys = schema.allKeys();
  const AttributeUpdates = {};

  for (let i = 0; i < keys.length; i += 1) {
    if (obj.isModified(keys[i]) && schema.partitionKey() !== keys[i]) {
      AttributeUpdates[keys[i]] = {
        Action: obj[keys[i]] === undefined ? 'ADD' : 'PUT',
        Value: obj[keys[i]],
      };
    }
  }

  utils.merge(query, { AttributeUpdates });
}

/**
 * Get gey and value of an object in a schema.
 */
function keyAndValue(schema, object) {
  const key = schema.partitionKey();
  const result = {};
  result[key] = object[key];
  return result;
}

/**
 * Convert Schema to Dynamo on put operations.
 */
export function updateSchemaToDynamo() {
  return (input, output, schema) => {
    output.Key = keyAndValue(schema, input);
    updateQuery(schema, output, input);
    utils.merge(output, input);
  };
}

/**
 * Convert output put operation to output data.
 */
export function updateReturnValues() {
  return (err, result, output /* , schema */) => {
    if (!err) {
      utils.merge(output, result);
    }
  };
}
