/*!
 * Number Serializer.
 */

/**
 * Represent an SchemaNumber.
 * @constructor
 */
function SchemaNumber() {}

SchemaNumber.prototype.stringfy = data => data;

SchemaNumber.prototype.parse = data => Number(data);

SchemaNumber.prototype.type = 'number';

module.exports = SchemaNumber;
