/**
 * Scan Middlewares.
 */

var utils = require('../../dynamito.utils');

/**
 * Convert Schema to Dynamo on put operations.
 */
export function scanSchemaToDynamo() {
  return (input, output /* , schema*/) => {
    utils.merge(output, input);
  };
}
