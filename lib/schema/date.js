/*!
 * Date Serializer.
 */

/**
 * Represent an SchemaDate.
 * @constructor
 */
function SchemaDate() {}

SchemaDate.prototype.stringfy = data => data.toISOString();

SchemaDate.prototype.parse = data => new Date(data);

SchemaDate.prototype.type = 'string';

module.exports = SchemaDate;
