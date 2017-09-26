import Promise from 'bluebird';

import * as Core from './dynamito.core';
import Config from './dynamito.config';

/**
 * List all Dynamo Tables.
 */
export function listTables() {
  return new Promise((resolve, reject) => {
    Core.dynamoDB().listTables({}, (err, data) => {
      if (err) {
        reject(err);
      } else {
        const prefix = Config.createTableName('');
        resolve(data.TableNames.filter(name => name.indexOf(prefix) === 0));
      }
    });
  });
}
