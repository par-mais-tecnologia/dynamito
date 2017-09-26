/**
 * Query Middlewares.
 */

import { merge } from '../../dynamito.utils';

/**
 * Convert Schema to Dynamo on put operations.
 */
export function querySchemaToDynamo() {
  return (input, output /* , schema */) => {
    merge(output, input);
  };
}
