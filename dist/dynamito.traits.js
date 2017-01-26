'use strict';

/**
 * Amazon Wrap create amazon table in development environment
 */

// Dynamito Traits
var dynamoMapType = {
  string: 'S',
  stringSet: 'SS',
  boolean: 'BOOL',
  booleanBlob: 'B',
  booleanSet: 'BB',
  list: 'L',
  map: 'M',
  number: 'N',
  numberSet: 'NS',
  null: 'NULL'
};
var keyTypes = ['HASH', 'RANGE'];
var pKey = keyTypes[0];
var sKey = keyTypes[1];

function toDynamo(index) {
  return dynamoMapType[index || 'string'];
}

module.exports = {
  partitionKey: pKey,
  sortkey: sKey,

  toDynamo: toDynamo
};