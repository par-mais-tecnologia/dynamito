'use strict';

/**
 * Represent an SchemaString.
 * @constructor
 */
function SchemaString() {}

SchemaString.prototype.stringfy = function (data) {
  return data;
};

SchemaString.prototype.parse = function (data) {
  return data;
};

SchemaString.prototype.validations = [function (field) {
  return field !== '';
}];

SchemaString.prototype.type = 'string';

module.exports = SchemaString;