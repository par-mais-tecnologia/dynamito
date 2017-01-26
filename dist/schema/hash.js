/*!
 * HASH Key type.
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validations = exports.dynamoType = exports.type = exports.isRange = exports.isPartition = undefined;

var _dynamito = require('../dynamito.traits');

var _dynamito2 = _interopRequireDefault(_dynamito);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Set this key type as partition key?
 */
var isPartition = exports.isPartition = true;

/**
 * Set this key type as range key?
 */
var isRange = exports.isRange = false;

/**
 * Key Type
 */
var type = exports.type = 'partition';

/**
 * Dynamo Type of this Key
 */
var dynamoType = exports.dynamoType = _dynamito2.default.partitionKey;

var validations = exports.validations = [function (field) {
  return field !== undefined;
}];