/**
 * Amazon Wrap create amazon table in development environment
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.schemaToDynamoCreationObject = schemaToDynamoCreationObject;

exports.default = function (tableName, schema, callback) {
  // Configurable params.
  var autoCreatingTables = _dynamito4.default.optionals.creating;
  if (autoCreatingTables) {
    if (schema === undefined || tableName === undefined) {
      callback(new Error('Schema nor defined.'));
    } else {
      checkForAutoCreation(tableName, schema, callback);
    }
  } else {
    callback(null);
  }
};

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _dynamitoCore = require('./dynamito.core.js');

var _dynamitoCore2 = _interopRequireDefault(_dynamitoCore);

var _dynamito = require('./dynamito.traits');

var _dynamito2 = _interopRequireDefault(_dynamito);

var _dynamito3 = require('./dynamito.config');

var _dynamito4 = _interopRequireDefault(_dynamito3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Compute dynamo creation params based on given schema.
 */
function schemaToDynamoCreationObject(schema) {
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
      AttributeType: _dynamito2.default.toDynamo(shemaObject[key].meta.type)
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

  _dynamitoCore2.default.dynamoDB().createTable(tableData, function (err, data) {
    if (err && err.message !== 'Cannot create preexisting table') {
      _winston2.default.error('Error Creating Tables:', tableData, err);
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
  _dynamitoCore2.default.dynamoDB().listTables({}, function (err, data) {
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