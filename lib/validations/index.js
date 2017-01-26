/**
 * Commom validations.
 */

'use strict';

/**
 * Validate required fields.
 */
export function required() {
  return field => {
    return field !== undefined;
  };
}

/**
 * Validate empty Array
 */
export function isFilled() {
  return field => {
    return Array.isArray(field) && field.length !== 0;
  };
}

/**
 * Return validation functions to validate fields with enums;
 */
export function validateEnum(enums, required) {
  var req = (required === true);
  return field => {
    if (req === false && (field === undefined || field === '')) {
      return true;
    }
    return enums.indexOf(field) !== -1;
  };
}

/**
 * Return validation functions to validate arrays field with enums;
 */
export function validateEnumOnArray(enums, required) {
  var req = (required === true);
  return field => {
    if (req === false && (field === undefined || (Array.isArray(field) && field.length === 0))) {
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
