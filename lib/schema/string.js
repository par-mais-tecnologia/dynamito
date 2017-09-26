/**
 * Represent an SchemaString.
 * @constructor
 */
function SchemaString() {}

SchemaString.prototype.stringfy = data => data;

SchemaString.prototype.parse = data => data;

SchemaString.prototype.validations = [field => field !== ''];

SchemaString.prototype.type = 'string';

module.exports = SchemaString;
