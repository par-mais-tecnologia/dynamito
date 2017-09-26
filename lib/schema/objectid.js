/*!
 * ObjectId Serializer.
 */

/**
 * Represent an ObjectId.
 * @constructor
 */
function ObjectId() {}

ObjectId.prototype.stringfy = data => data;

ObjectId.prototype.parse = data => data;

ObjectId.prototype.type = 'string';

module.exports = ObjectId;
