import Promise from 'bluebird';

import Core from './dynamito.core.js';
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
        var prefix = Config.createTableName('');
        resolve(data.TableNames.filter(name => {
          return name.indexOf(prefix) === 0;
        }));
      }
    });
  });
}
