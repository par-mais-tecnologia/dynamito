/**
 * dynamito Types.
 */

import map from 'async/map';

import * as Utils from './dynamito.utils';
import * as DynamitoTypes from './schema/index';

class Path {
  constructor(name, obj) {
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
  validate(fn, message) {
    this.validations.push({
      fn,
      message,
    });
  }

  /**
   * Validate incomming object.
   *
   * TODO: Currentlly, is possible to return true or false and callback another value.
   * TODO: Error prone.
   */
  doValidation(obj, callback, model) {
    const self = this;

    function buildResponse(result, validation) {
      if (result === true) {
        return { result };
      }

      return { result, validation };
    }

    map(this.validations, (currentValidation, cb) => {
      const res = currentValidation.fn.call(obj, obj[self.name], (asyncResult) => {
        cb(null, buildResponse(asyncResult, currentValidation));
      }, model);
      if (res === true || res === false) {
        cb(null, buildResponse(res, currentValidation));
      }
    }, (err, results) => {
      for (let i = 0; i < results.length; i += 1) {
        if (results[i].result === false) {
          callback(results[i].validation.message);
          return;
        }
      }
      callback(err);
    });
  }
}


function createPath(key, obj) {
  const constructorName = Utils.getFunctionName(obj.type);

  // Available Types
  if (DynamitoTypes[constructorName] === undefined) {
    throw new Error(`Invalid field type: ${(constructorName || obj.type)}`);
  }

  // Override constructor by our managed data.
  obj.meta = new DynamitoTypes[constructorName]();

  return new Path(key, obj);
}

export default createPath;
