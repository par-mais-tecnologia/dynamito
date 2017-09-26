/*!
 * Mixed Serializer.
 */

/**
 * Represent an SchemaMixed.
 * @constructor
 */
function SchemaMixed() {}

SchemaMixed.prototype.stringfy = data => data;

SchemaMixed.prototype.parse = data => data;

SchemaMixed.prototype.type = 'map';

module.exports = SchemaMixed;
