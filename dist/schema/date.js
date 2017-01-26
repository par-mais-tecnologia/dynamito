'use strict';

/*!
 * Date Serializer.
 */

/**
 * Represent an SchemaDate.
 * @constructor
 */
function SchemaDate() {}

SchemaDate.prototype.stringfy = function (data) {
  return data.toISOString();
};

SchemaDate.prototype.parse = function (data) {
  return new Date(data);
};

SchemaDate.prototype.type = 'string';

module.exports = SchemaDate;