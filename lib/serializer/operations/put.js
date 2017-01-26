/**
 * Put Middlewares.
 */

/**
 * Convert Schema to Dynamo on put operations.
 */
export function putSchemaToDynamo() {
  return (input, output /* , schema*/) => {
    output.Item = input.toJSON();
  };
}

/**
 * Convert output put operation to output data.
 */
export function putReturnValues() {
  return () => {};
}
