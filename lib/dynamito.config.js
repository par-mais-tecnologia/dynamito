/**
 * Amazon DynamoDb basic configuration.
 */

import _ from 'lodash';

/**
 * AWS Dynamo Configuration.
 * type: Object
 *
 * {
  accessKeyId: 'your dynamo key',
  secretAccessKey: 'your key secret',

  region: 'your dynamo region'
  endpoint: 'your dynamo url'
 }
 */
const awsCofig = {};

/**
 * Optional configuration.
 *
 * creating: Auto creating tables.
 * production: In Production, Dynamito never create tables.
 * listtables: Set to true to check for created tables when registering models.
 * It is useful to identify in logs which table was not created yet.
 *
 * // '{appName}-{moduleName}-{environmen}-{ModelName}' -- '-' is not aplied if prefix is absent.
 * appName: Will append Application name to models.
 * moduleName: Will append ModuleName to models.
 * environment: Will append environments to models.
 *
 */
let optional = {
  production: true,
  creating: false,
  listtables: false,

  appName: undefined,
  moduleName: undefined,
  environment: undefined,
};

function configure(data) {
  Object.assign(awsCofig, {
    region: data.region || '',
    endpoint: data.endpoint || '',

    accessKeyId: data.accessKeyId || '',
    secretAccessKey: data.secretAccessKey || '',
  });

  optional = _.merge(
    optional,
    {
      creating: data.creating,
      production: data.production,
      verbose: data.verbose,
      listtables: data.listtables,

      appName: data.appName,
      moduleName: data.moduleName,
      environment: data.environment,

      customCore: data.core,
    });
  return {
    aws: awsCofig,
    production: optional.production,
    verbose: optional.verbose,
    listTables: optional.listtables,
    customCore: optional.customCore,
  };
}

/**
 * Create table name, including prefixes.
 */
function createTableName(rawTableName) {
  return [
    optional.appName,
    optional.environment,
    rawTableName,
  ]
    .filter(value => value && value.length)
    .join('-');
}

module.exports = {
  configure,
  optionals: optional,
  createTableName,
};
