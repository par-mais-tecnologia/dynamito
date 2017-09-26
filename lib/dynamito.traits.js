/**
 * Amazon Wrap create amazon table in development environment
 */

// Dynamito Traits
const dynamoMapType = {
  string: 'S',
  stringSet: 'SS',
  boolean: 'BOOL',
  booleanBlob: 'B',
  booleanSet: 'BB',
  list: 'L',
  map: 'M',
  number: 'N',
  numberSet: 'NS',
  null: 'NULL',
};
const keyTypes = ['HASH', 'RANGE'];
const pKey = keyTypes[0];
const sKey = keyTypes[1];

function toDynamo(index) {
  return dynamoMapType[index || 'string'];
}

export {
  pKey as partitionKey,
  sKey as sortkey,

  toDynamo,
};
