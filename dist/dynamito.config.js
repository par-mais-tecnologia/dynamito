'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * AWS Dynamo Configuration.
 * type: Object
 *
 * {
  accessKeyId: 'your dynamo jey',
  secretAccessKey: 'yout key secret',

  region: 'your dynamo region'
  endpoint: 'yout dynamo url'
 }
 */
var awsCofig = {};

/**
 * Optional configuration.
 *
 * creating: Auto creating tables.
 * production: On Production, Dynamito never create tables.
 * listtables: Set to true to check for created tables when registering models. It is usefull to identify on logs which table was not creatd yet.
 *
 * // '{appName}-{moduleName}-{environmen}-{ModelName}' -- '-' is not aplied if prefix is ausent.
 * appName: Will apeend Application name to models.
 * moduleName: Will append ModuleName to models.
 * environment: Will append enviromnets to models.
 *
 */
/**
 * Amazon DynamoDb basic configuration.
 */

var optional = {
  production: true,
  creating: false,
  listtables: false,

  appName: undefined,
  moduleName: undefined,
  environment: undefined
};

function configure(data) {
  awsCofig = {
    region: data.region || '',
    endpoint: data.endpoint || '',

    accessKeyId: data.accessKeyId || '',
    secretAccessKey: data.secretAccessKey || ''
  };
  optional = _lodash2.default.merge(optional, {
    creating: data.creating,
    production: data.production,
    verbose: data.verbose,
    listtables: data.listtables,

    appName: data.appName,
    moduleName: data.moduleName,
    environment: data.environment,

    customCore: data.core
  });
  return {
    aws: awsCofig,
    production: optional.production,
    verbose: optional.verbose,
    listTables: optional.listtables,
    customCore: optional.customCore
  };
}

/**
 * Create table name, including prefixes.
 */
function createTableName(rawTableName) {
  if (optional.environment !== undefined) {
    rawTableName = optional.environment + '-' + rawTableName;
  }
  if (optional.moduleName !== undefined) {
    rawTableName = optional.moduleName + '-' + rawTableName;
  }
  if (optional.appName !== undefined) {
    rawTableName = optional.appName + '-' + rawTableName;
  }
  return rawTableName;
}

module.exports = {
  configure: configure,
  optionals: optional,
  createTableName: createTableName
};