'use strict';

/*!
 * ObjectId Serializer.
 */

/**
 * Represent an ObjectId.
 * @constructor
 */
function ObjectId() {}

ObjectId.prototype.stringfy = function (data) {
  return data;
};

ObjectId.prototype.parse = function (data) {
  return data;
};

ObjectId.prototype.type = 'string';

module.exports = ObjectId;