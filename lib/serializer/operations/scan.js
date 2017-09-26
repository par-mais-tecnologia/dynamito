/**
 * Scan Middlewares.
 */

import { merge } from '../../dynamito.utils';

/**
 * Convert Schema to Dynamo on put operations.
 */
export function scanSchemaToDynamo() {
  return (input, output /* , schema */) => {
    merge(output, input);
  };
}
