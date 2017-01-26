'use strict';

/*!
 * Number Serializer.
 */

/**
 * Represent an SchemaNumber.
 * @constructor
 */
function SchemaNumber() {}

SchemaNumber.prototype.stringfy = function (data) {
  return data;
};

SchemaNumber.prototype.parse = function (data) {
  return Number(data);
};

SchemaNumber.prototype.type = 'number';

module.exports = SchemaNumber;