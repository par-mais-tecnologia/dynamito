/**
 * Amazon Wrap create amazon table in development environment
 */

import winston from 'winston';

import * as Core from './dynamito.core';
import { toDynamo } from './dynamito.traits';
import Config from './dynamito.config';

/**
 * Compute dynamo creation params based on given schema.
 */
export function schemaToDynamoCreationObject(schema) {
  // AttributeName: "year", KeyType: "HASH"
  const keySchemas = [];
  // AttributeName: "year", AttributeType: "N"
  const attributeDefinitionss = [];

  const shcemaObject = schema.getObject();

  for (const key in shcemaObject) {
    if (shcemaObject[key].keyType !== undefined) {
      // Key Schema
      const cKey = {
        AttributeName: key,
        KeyType: shcemaObject[key].keyType.dynamoType || undefined,
      };
      keySchemas.push(cKey);

      const atDef = {
        AttributeName: key,
        AttributeType: toDynamo(shcemaObject[key].meta.type),
      };
      attributeDefinitionss.push(atDef);
    }
  }

  return {
    keySchema: keySchemas,
    attributeDefinitions: attributeDefinitionss,
    provisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
  };
}

/**
 * Create a table from schema with tableName
 */
function createTable(tableName, schema, callback) {
  const dynamoSchema = schemaToDynamoCreationObject(schema);
  const tableData = {
    TableName: tableName,
    KeySchema: dynamoSchema.keySchema,
    AttributeDefinitions: dynamoSchema.attributeDefinitions,
    ProvisionedThroughput: dynamoSchema.provisionedThroughput,
  };

  Core.dynamoDB().createTable(tableData, (err, data) => {
    if (err && err.message !== 'Cannot create preexisting table') {
      winston.error('Error Creating Tables:', tableData, err);
      callback(err);
    } else {
      callback(null, `Created table. Table description JSON: ${JSON.stringify(data, null, 2)}`);
    }
  });
}

/**
 * Check for automatically creating tables.
 */
function checkForAutoCreation(tableName, schema, callback) {
  // Check if table is already created.
  // Usefull variables.
  Core.dynamoDB().listTables({}, (err, data) => {
    if (err) {
      callback(err);
    } else if (data.TableNames.indexOf(tableName) === -1) {
      // Create
      createTable(tableName, schema, callback);
    } else {
      // Already Created.
      callback(null);
    }
  });
}

export default function (tableName, schema, callback) {
  // Configurable params.
  const autoCreatingTables = Config.optionals.creating;
  if (autoCreatingTables) {
    if (schema === undefined || tableName === undefined) {
      callback(new Error('Schema nor defined.'));
    } else {
      checkForAutoCreation(tableName, schema, callback);
    }
  } else {
    callback(null);
  }
}
