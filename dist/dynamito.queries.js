'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Between = exports.GTEqual = exports.GT = exports.LTEqual = exports.LT = exports.Equal = undefined;

var _util = require('util');

function Query(key, value, operator, extra) {
  this.key = key;
  this.value = value;
  this.operator = operator;
  this.extra = extra;

  this.mode = undefined;
} /**
   * Dynamo Queries to Queries and Filters to be used on scans.
   */

Query.prototype.SCAN = 'scan';
Query.prototype.QUERY = 'query';

Query.prototype.setMode = function (mode) {
  this.mode = mode;
};

Query.prototype._getModeKey = function () {
  if (this.mode === Query.prototype.SCAN) {
    return 'FilterExpression';
  } else if (this.mode === Query.prototype.QUERY) {
    return 'KeyConditionExpression';
  }
  return '';
};

Query.prototype._buildExpression = function (index, schema, element) {
  var path = schema.path(this.key);
  var modeKey = this._getModeKey();

  element[modeKey] += '#name' + index + ' ' + this.operator + ' :value' + index;

  element.ExpressionAttributeNames['#name' + index] = this.key;

  element.ExpressionAttributeValues[':value' + index] = path.meta.stringfy(this.value);
};

Query.prototype.fill = function (index, schema, element) {
  var modeKey = this._getModeKey();
  element[modeKey] = element[modeKey] || '';
  element.ExpressionAttributeValues = element.ExpressionAttributeValues || {};
  element.ExpressionAttributeNames = element.ExpressionAttributeNames || {};

  if (element[modeKey] !== '') {
    element[modeKey] += ' AND ';
  }

  this._buildExpression(index, schema, element);
};

/**
 * Query to fetch equals.
 * @param key
 * @param value
 * @constructor
 */
function Equal(key, value) {
  Query.call(this, key, value, '=');
}
(0, _util.inherits)(Equal, Query);

/**
 * Query to fetch lesser then.
 * @param key
 * @param value
 * @constructor
 */
function LT(key, value) {
  Query.call(this, key, value, '<');
}
(0, _util.inherits)(LT, Query);

/**
 * Query to fetch lesser then or equal
 * @param key
 * @param value
 * @constructor
 */
function LTEqual(key, value) {
  Query.call(this, key, value, '<=');
}
(0, _util.inherits)(LTEqual, Query);

/**
 * Query to fetch greater then.
 * @param key
 * @param value
 * @constructor
 */
function GT(key, value) {
  Query.call(this, key, value, '>');
}
(0, _util.inherits)(GT, Query);

/**
 * Query to fetch greater then or equal.
 * @param key
 * @param value
 * @constructor
 */
function GTEqual(key, value) {
  Query.call(this, key, value, '>=');
}
(0, _util.inherits)(GTEqual, Query);

/**
 * Query to fetch intervals.
 * @param key
 * @param valueA Start value.
 * * @param valueB Ed value.
 * @constructor
 */
function Between(key, valueA, valueB) {
  Query.call(this, key, valueA, 'BETWEEN', valueB);
}
(0, _util.inherits)(Between, Query);

Between.prototype._buildExpression = function (index, schema, element) {
  var path = schema.path(this.key);
  var modeKey = this._getModeKey();

  element.ExpressionAttributeNames['#name' + index] = this.key;

  element[modeKey] += '#name' + index + ' ' + this.operator + ' :value' + index;
  element.ExpressionAttributeValues[':value' + index] = path.meta.stringfy(this.value);

  element[modeKey] += ' AND :value' + index + '_extra';
  element.ExpressionAttributeValues[':value' + index + '_extra'] = path.meta.stringfy(this.extra);
};

exports.Equal = Equal;
exports.LT = LT;
exports.LTEqual = LTEqual;
exports.GT = GT;
exports.GTEqual = GTEqual;
exports.Between = Between;