/**
 * Common validations.
 */

/**
 * Validate required fields.
 */
export const required = () => field => field !== undefined;

/**
 * Validate empty Array
 */
export const isFilled = () => field => Array.isArray(field) && field.length !== 0;

/**
 * Return validation functions to validate fields with enums;
 */
export function validateEnum(enums, isRequired) {
  const req = (isRequired === true);
  return (field) => {
    if (req === false && (field === undefined || field === '')) {
      return true;
    }
    return enums.indexOf(field) !== -1;
  };
}

/**
 * Return validation functions to validate arrays field with enums;
 */
export function validateEnumOnArray(enums, isRequired) {
  const req = (isRequired === true);
  return (field) => {
    if (req === false && (field === undefined || (Array.isArray(field) && field.length === 0))) {
      return true;
    }
    if (field === undefined) {
      return false;
    }

    for (let i = 0; i < field.length; i += 1) {
      const c = field[i];
      if (enums.indexOf(c) === -1) {
        return false;
      }
    }
    return true;
  };
}
