/**
 * dynamito Types.
 */

'use strict';

var Utils = require('./dynamito.utils');

var DynamitoTypes = require('./schema/index');

var map = require('async/map');

function Path(name, obj) {
  if (!(this instanceof Path)) {
    return new Path(obj);
  }

  this.name = name;
  this.validations = [];
  this.array = Array.isArray(obj.type);
  if (this.array) {
    obj.type = obj.type[0];
  }

  // Merge
  Utils.merge(this, obj);
}

/**
 * Add a validation to this path.
 */
Path.prototype.validate = function (fn, message) {
  this.validations.push({
    fn: fn,
    message: message
  });
};

/**
 * Validate incomming object.
 *
 * TODO: Currentlly, is possible to return true or false and callback another value.
 * TODO: Error prone.
 */
Path.prototype.doValidation = function (obj, callback, model) {
  var self = this;

  function buildResponse(result, validation) {
    if (result === true) {
      return {
        result: result
      };
    }

    return {
      result: result,
      validation: validation
    };
  }

  map(this.validations, function (currentValidation, cb) {
    var res = currentValidation.fn.call(obj, obj[self.name], function (asyncResult) {
      cb(null, buildResponse(asyncResult, currentValidation));
    }, model);
    if (res === true || res === false) {
      cb(null, buildResponse(res, currentValidation));
    }
  }, function (err, results) {
    for (var i = 0; i < results.length; i++) {
      if (results[i].result === false) {
        callback(results[i].validation.message);
        return;
      }
    }
    callback(err);
  });
};

function createPath(key, obj) {
  var constructorName = Utils.getFunctionName(obj.type);

  // Available Types
  if (DynamitoTypes[constructorName] === undefined) {
    throw new Error('Invalid field type: ' + (constructorName || obj.type));
  }

  // Override constructor by our managed data.
  obj.meta = new DynamitoTypes[constructorName]();

  return new Path(key, obj);
}

module.exports = {
  createPath: createPath
};