import Dynamito from '../lib';

import DynamitoMemory from '../dynamito-memory';

// Initialize Database
Dynamito.configure({
  // accessKeyId: config.aws.awsKey,
  // secretAccessKey: config.aws.awsSecret,

  region: 'sa-east-1',
  endpoint: 'http://localhost:8000',

  environment: 'Test',

  production: false,
  listtables: false,
  // Auto create tables, when production is not configured.
  creating: true,
  verbose: false,

  core: DynamitoMemory
});
