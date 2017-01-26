/**
 * Query Middlewares.
 */

var utils = require('../../dynamito.utils');

/**
 * Convert Schema to Dynamo on put operations.
 */
export function querySchemaToDynamo() {
  return (input, output /* , schema*/) => {
    utils.merge(output, input);
  };
}
