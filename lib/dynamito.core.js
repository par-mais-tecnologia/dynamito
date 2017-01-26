/**
 * Amazon DynamoDb basic configuration.
 */

import winston from 'winston';

var AWS = require('aws-sdk');
var Promise = require('bluebird');

var serializer = require('./serializer');
import Config from './dynamito.config';

// Controlling if this module is correctlly
var configured = false;
var productionMode = true;

// AWS Dynamo DB, to create and delete tables.
var dynamoDb;

// Available Models
var models = {};

// Verbose mode
var verboseMode = false;

// Listing tables when registering models, to check if that tables is already created or not.
var listtables = false;

/**
 * Initialize Dynamito library.
 *
 * @production Flag to never load 'tables' module on production.
 */
function initialize(data, production, verbose, listdyntables, customCore) {
  productionMode = production;
  verboseMode = verbose;
  listtables = listdyntables;

  if (verboseMode) {
    winston.info('Configuring AWS...');
    winston.info(data);
  }
  AWS.config.update(data);

  var DynamoInst;
  if (customCore === undefined) {
    DynamoInst = AWS.DynamoDB;
  } else {
    if (verbose) {
      winston.warn('DynamoDB core Overrided: Application may not be connected to database.');
    }
    DynamoInst = customCore;
  }

  dynamoDb = new DynamoInst();
  serializer.initialize(new DynamoInst.DocumentClient());
  configured = true;
}

export function configure(data) {
  var configuration = Config.configure(data);
  initialize(
    configuration.aws,
    configuration.production,
    configuration.verbose,
    configuration.listTables,
    configuration.customCore);
}

function dynamo() {
  if (configured === false) {
    throw new Error('Dynamito is not configured yetFinished migration of Financial Product Extra Data. Please, configure it first.');
  }
  return dynamoDb;
}

/**
 * When not in production mode, check if have to create table with tableName, to specific schema.
 */
function check(tableName, schema, callback) {
  var trueName = Config.createTableName(tableName);

  if (productionMode === true) {
    // On production, just resolve.
    callback();
  } else {
    var checkFunction = require('./dynamito.tables').default;
    checkFunction(trueName, schema, callback);
  }
}

var tablesInitialized = false;
var tables;

function getTables() {
  return new Promise((resolve, reject) => {
    if (tablesInitialized === true || !listtables) {
      return resolve(tables || []);
    }

    dynamoDb.listTables({}, (err, data) => {
      if (err) {
        reject(err);
      } else {
        tablesInitialized = true;
        tables = data.TableNames;
        resolve(data.TableNames);
      }
    });
  });
}

/**
 * Register a created model.
 */
function registerModel(tableName, model) {
  getTables()
    .then(tables => {
      if (listtables && tables.indexOf(tableName) === -1) {
        winston.warn(tableName + ' is not created on your environment.');
      }
      models[tableName] = model;
    });
}

/**
 * GEt an available module by its name.
 * @param tableName
 * @returns {*}
 */
function getModel(tableName) {
  return models[tableName];
}

module.exports = {
  dynamoDB: dynamo,

  // Core Operations
  configure: configure,

  // Helper
  check: check,
  registerModel: registerModel,
  getModel: getModel,

  modelTrueName: modelName => {
    return Config.createTableName(modelName);
  },
  /**
   * Give Dynamo Core capability to access tables documents, what will lead to enable entire application to access this.
   */
  table: table => {
    var trueName = Config.createTableName(table);
    return serializer.table(trueName);
  }
};
