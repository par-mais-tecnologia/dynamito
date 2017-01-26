/**
 * BatchWrite Middleware.
 */

import winston from 'winston';

/**
 * Convert Schema to Dynamo on put operations.
 */
export function batchWriteSchemaToDynamo() {
  return (input, output /* , schema*/) => {
    var table = output.TableName;
    delete output.TableName;

    output.RequestItems = {};
    output.RequestItems[table] = [];

    for (var i = 0; i < input.length; i++) {
      var item = {
        PutRequest: {
          Item: input[i].toJSON()
        }
      };
      output.RequestItems[table].push(item);
    }
  };
}

export function posValidation() {
  function recursiveValidation(document, operation, table, input, result, callback) {
    if (result.UnprocessedItems[table] === undefined) {
      callback(null);
    } else {
      var ri = {RequestItems: {}};
      ri.RequestItems = result.UnprocessedItems;

      setTimeout((doc, opr, data) => {
        winston.verbose('Dynamito: Retrying BatchWrite items.');
        doc[opr](data, (err, result) => {
          if (err) {
            callback(err, {});
          } else {
            recursiveValidation(document, operation, table, input, result, callback);
          }
        });
      }, 5000, document, operation, ri);
    }
  }
  return recursiveValidation;
}

/**
 * Convert output put operation to output data.
 */
export function batchWriteReturnValues() {
  return () => {};
}
