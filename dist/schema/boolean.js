'use strict';

/*!
 * Boolean Serializer.
 */

/**
 * Represent an SchemaBoolean.
 * @constructor
 */
function SchemaBoolean() {}

SchemaBoolean.prototype.stringfy = function (data) {
  return data;
};

SchemaBoolean.prototype.parse = function (data) {
  if (typeof data === 'string') {
    if (data === 'true') {
      return true;
    } else if (data === 'false') {
      return false;
    }
    return undefined;
  }
  return Boolean(data);
};

SchemaBoolean.prototype.type = 'boolean';

module.exports = SchemaBoolean;