'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dynamito = require('./dynamito.model');

var _dynamito2 = _interopRequireDefault(_dynamito);

var _dynamito3 = require('./dynamito.schema');

var _dynamito4 = _interopRequireDefault(_dynamito3);

var _dynamito5 = require('./dynamito.core');

var _dynamito6 = _interopRequireDefault(_dynamito5);

var _dynamito7 = require('./dynamito.queries');

var Queries = _interopRequireWildcard(_dynamito7);

var _dynamito8 = require('./dynamito.access');

var Access = _interopRequireWildcard(_dynamito8);

var _dynamito9 = require('./dynamito.finder');

var _dynamito10 = _interopRequireDefault(_dynamito9);

var _dynamito11 = require('./dynamito.events');

var _dynamito12 = _interopRequireDefault(_dynamito11);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Dyanmito() {
  this.eventListner = new _dynamito12.default();
  this.modelSchemas = {};
} /**
   * Amazon Wrap to manipulate models at DynamoDb
   */

Dyanmito.prototype.configure = _dynamito6.default.configure;
Dyanmito.prototype.access = Access;
Dyanmito.prototype.Schema = _dynamito4.default;
Dyanmito.prototype.Queries = Queries;
Dyanmito.prototype.Finder = _dynamito10.default;

/**
 * Crete a new model object from an schema.
 * @param name
 * @param schema
 */
Dyanmito.prototype.model = function (name, schema) {
  // look up schema for the collection.
  if (!this.modelSchemas[name]) {
    if (schema) {
      // cache it so we only apply plugins once
      this.modelSchemas[name] = schema;
    } else {
      throw new Error('Missing Schema: ' + name);
    }
  }

  // ensure a schema exists
  if (!schema) {
    schema = this.modelSchemas[name];
    if (!schema) {
      throw new Error('Missing Schema: ' + name);
    }
  }

  return _dynamito2.default.compile(name, schema, this);
};

exports.default = new Dyanmito();