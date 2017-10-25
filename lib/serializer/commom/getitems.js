/**
 * Scan Middlewares.
 */

import winston from 'winston';
import process from 'process';

/**
 * Convert output put operation to output data.
 */
export function getArray() {
  return (err, result, output /* , schema */) => {
    if (!err) {
      output.data = [...result.Items];
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

export function sortArray() {
  return (err, result, output, schema) => {
    if (!err) {
      const prim = schema.partitionKey();
      output.data.sort((a, b) => {
        if (a[prim] > b[prim]) {
          const secondKeyA = schema.sortkey();
          if (secondKeyA !== undefined) {
            return sortByRange(a[secondKeyA], b[secondKeyA]);
          }
          return 1;
        } else if (a[prim] < b[prim]) {
          const secondKeyB = schema.sortkey();
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

export function posScanValidation() {
  return function recursiveValidation(document, operation, table, input, result, callback) {
    if (result.LastEvaluatedKey === undefined) {
      callback(null);
    } else {
      const ri = {
        ...input,
        ExclusiveStartKey: result.LastEvaluatedKey,
      };
      winston.verbose('Dynamito: Retrying to get next page.');
      document[operation](ri, (err, recResult) => {
        if (err) {
          callback(err, {});
        } else {
          // Append new items to main result object..
          process.nextTick(() => {
            recursiveValidation(
              document,
              operation,
              table,
              input,
              recResult,
              (recursiveErr, recursiveData) => {
                result.Items.push(...(recResult.Items || []));
                callback(recursiveErr, recursiveData);
              });
          });
        }
      });
    }
  };
}

/**
 * Convert output of a single item.
 */
export function getSingle() {
  return (err, result, output /* , schema */) => {
    if (!err) {
      output.data = {
        ...result.Item,
      };
    }
  };
}
