'use strict';

/*!
 * Module exports.
 */

// ---
// Types
exports.String = require('./string');

exports.Number = require('./number');

exports.Boolean = require('./boolean');

exports.Date = require('./date');

exports.Object = require('./mixed');
// ---

// ---
// keys
exports.HASH = require('./hash');
exports.RANGE = require('./range');
// ---

// ---
// Special Types
exports.ObjectId = require('./objectid');
// ---
// ---
// aliases
exports.Bool = exports.Boolean;
// ---