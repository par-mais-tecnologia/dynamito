/**
 * Amazon Wrap create amazon table in development environment
 */

'use strict';

import winston from 'winston';

import * as Core from './dynamito.core.js';
import Traits from './dynamito.traits';
import Config from './dynamito.config';

/**
 * Compute dynamo creation params based on given schema.
 */
export function schemaToDynamoCreationObject(schema) {
  // AttributeName: "year", KeyType: "HASH"
  var keySchemas = [];
  // AttributeName: "year", AttributeType: "N"
  var attributeDefinitionss = [];

  var shemaObject = schema.getObject();

  for (var key in shemaObject) {
    if (shemaObject[key].keyType === undefined) {
      continue;
    }

    // Key Schema
    var cKey = {
      AttributeName: key,
      KeyType: shemaObject[key].keyType.dynamoType || undefined
    };
    keySchemas.push(cKey);

    var atDef = {
      AttributeName: key,
      AttributeType: Traits.toDynamo(shemaObject[key].meta.type)
    };
    attributeDefinitionss.push(atDef);
  }

  return {
    keySchema: keySchemas,
    attributeDefinitions: attributeDefinitionss,
    provisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    }
  };
}

/**
 * Create a table from schema with tableName
 */
function createTable(tableName, schema, callback) {
  var dynamoSchema = schemaToDynamoCreationObject(schema);
  var tableData = {
    TableName: tableName,
    KeySchema: dynamoSchema.keySchema,
    AttributeDefinitions: dynamoSchema.attributeDefinitions,
    ProvisionedThroughput: dynamoSchema.provisionedThroughput
  };

  Core.dynamoDB().createTable(tableData, (err, data) => {
    if (err && err.message !== 'Cannot create preexisting table') {
      winston.error('Error Creating Tables:', tableData, err);
      callback(err);
    } else {
      callback(null, 'Created table. Table description JSON: ' + JSON.stringify(data, null, 2));
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
  var autoCreatingTables = Config.optionals.creating;
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
