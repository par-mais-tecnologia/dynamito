/**
 * Delete Middlewares.
 */

import * as Utils from '../../dynamito.utils';

/**
 * Convert Schema to Dynamo on put operations.
 */
export function deleteSchemaToDynamo() {
  return (input, output /* , schema*/) => {
    Utils.merge(output, {
      Key: input.keyAndValue()
    });
  };
}

/**
 * Convert output put operation to output data.
 */
export function deleteReturnValues() {
  return (err, result, output /* , schema*/) => {
    if (!err) {
      Utils.merge(output, result);
    }
  };
}
