export function batchGetSchemaToDynamo() {
  return (input, output, schema) => {
    const table = output.TableName;
    const key = input.Key;
    delete output.TableName;

    const keys = [schema.partitionKey()];
    if (schema.sortkey() !== undefined) {
      keys.push(schema.sortkey());
    }

    output.RequestItems = {};
    output.RequestItems[table] = {
      AttributesToGet: key,
      Keys: keys,
    };
  };
}

export function batchGetReturnValues() {
  return () => {
  };
}

export function batchGetPosValidation() {
  function recursiveValidation(document, operation, table, input, result, callback) {
    callback(null);
  }

  return recursiveValidation;
}
