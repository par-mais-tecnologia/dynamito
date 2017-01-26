/* global toString */
/*!
 * Module dependencies.
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isObject = isObject;
exports.merge = merge;
exports.isEmptyObject = isEmptyObject;
exports.isFunction = isFunction;
exports.getFunctionName = getFunctionName;
exports.extendByAttributes = extendByAttributes;
exports.generateId = generateId;

var _cuid = require('cuid');

var _cuid2 = _interopRequireDefault(_cuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*!
 * Determines if `arg` is an object.
 *
 * @param {Object|Array|String|Function|RegExp|any} arg
 * @api private
 * @return {Boolean}
 */

function isObject(arg) {
  if (Buffer.isBuffer(arg)) {
    return true;
  }
  return toString.call(arg) === '[object Object]';
}

function merge(mergeIn, obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      mergeIn[key] = obj[key];
    }
  }
}

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && JSON.stringify(obj) === JSON.stringify({});
}

function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function getFunctionName(fn) {
  if (fn.name) {
    return fn.name;
  }
  return (fn.toString().trim().match(/^function\s*([^\s(]+)/) || [])[1];
}

function extendByAttributes(target, source, keys) {
  keys.forEach(function (key) {
    if (source[key] !== undefined) {
      target[key] = source[key];
    }
  });
}

function generateId() {
  return (0, _cuid2.default)();
}