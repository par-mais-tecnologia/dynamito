import cuid from 'cuid';

/*!
 * Determines if `arg` is an object.
 *
 * @param {Object|Array|String|Function|RegExp|any} arg
 * @api private
 * @return {Boolean}
 */

export function isObject(arg) {
  if (Buffer.isBuffer(arg)) {
    return true;
  }
  return toString.call(arg) === '[object Object]';
}

export function merge(mergeIn, obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      mergeIn[key] = obj[key];
    }
  }
}

export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && JSON.stringify(obj) === JSON.stringify({});
}

export function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

export function getFunctionName(fn) {
  if (fn.name) {
    return fn.name;
  }
  return (fn.toString().trim().match(/^function\s*([^\s(]+)/) || [])[1];
}

export function extendByAttributes(target, source, keys) {
  keys.forEach(key => {
    if (source[key] !== undefined) {
      target[key] = source[key];
    }
  });
}

export function generateId() {
  return cuid();
}
