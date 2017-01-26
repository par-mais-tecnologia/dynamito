'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.listTables = listTables;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _dynamitoCore = require('./dynamito.core.js');

var _dynamitoCore2 = _interopRequireDefault(_dynamitoCore);

var _dynamito = require('./dynamito.config');

var _dynamito2 = _interopRequireDefault(_dynamito);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * List all Dynamo Tables.
 */
function listTables() {
  return new _bluebird2.default(function (resolve, reject) {
    _dynamitoCore2.default.dynamoDB().listTables({}, function (err, data) {
      if (err) {
        reject(err);
      } else {
        var prefix = _dynamito2.default.createTableName('');
        resolve(data.TableNames.filter(function (name) {
          return name.indexOf(prefix) === 0;
        }));
      }
    });
  });
}