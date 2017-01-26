/*!
 * Mixed Serializer.
 */

/**
 * Represent an SchemaMixed.
 * @constructor
 */
function SchemaMixed() {}

SchemaMixed.prototype.stringfy = function (data) {
  return data;
};

SchemaMixed.prototype.parse = function (data) {
  return data;
};

SchemaMixed.prototype.type = 'map';

module.exports = SchemaMixed;
