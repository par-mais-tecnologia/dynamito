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
var isPartition = exports.isPartition = false;

/**
 * Set this key type as range key?
 */
/*!
 * RANGE Key type.
 */

var isRange = exports.isRange = true;

/**
 * Key Type
 */
var type = exports.type = 'range';

/**
 * Dynamo Type of this Key
 */
var dynamoType = exports.dynamoType = _dynamito2.default.sortkey;

var validations = exports.validations = [function (field) {
  return field !== undefined;
}];