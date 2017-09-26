/**
 * Put Middlewares.
 */

/**
 * Convert Schema to Dynamo on put operations.
 */
export function getSchemaToDynamo() {
  return (input, output, schema) => {
    const hash = input.hash;
    const range = input.range;

    const key = schema.partitionKey();
    const skey = schema.sortkey();
    const s = {};
    s[key] = hash;
    if (skey !== undefined) {
      s[skey] = range;
    }
    output.Key = s;
    output.ExpressionAttributeNames = input.ExpressionAttributeNames;
    output.ProjectionExpression = input.ProjectionExpression;
  };
}
