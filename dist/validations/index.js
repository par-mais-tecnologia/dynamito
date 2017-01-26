/**
 * Commom validations.
 */

'use strict';

/**
 * Validate required fields.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.required = required;
exports.isFilled = isFilled;
exports.validateEnum = validateEnum;
exports.validateEnumOnArray = validateEnumOnArray;
function required() {
  return function (field) {
    return field !== undefined;
  };
}

/**
 * Validate empty Array
 */
function isFilled() {
  return function (field) {
    return Array.isArray(field) && field.length !== 0;
  };
}

/**
 * Return validation functions to validate fields with enums;
 */
function validateEnum(enums, required) {
  var req = required === true;
  return function (field) {
    if (req === false && (field === undefined || field === '')) {
      return true;
    }
    return enums.indexOf(field) !== -1;
  };
}

/**
 * Return validation functions to validate arrays field with enums;
 */
function validateEnumOnArray(enums, required) {
  var req = required === true;
  return function (field) {
    if (req === false && (field === undefined || Array.isArray(field) && field.length === 0)) {
      return true;
    }
    if (field === undefined) {
      return false;
    }

    for (var i = 0; i < field.length; i++) {
      var c = field[i];
      if (enums.indexOf(c) === -1) {
        return false;
      }
    }
    return true;
  };
}