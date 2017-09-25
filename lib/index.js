/**
 * Amazon Wrap to manipulate models at DynamoDb
 */

import DynamitoModel from './dynamito.model';
import Schema from './dynamito.schema';
import Core from './dynamito.core';
import * as Queries from './dynamito.queries';
import * as Access from './dynamito.access';
import Finder from './dynamito.finder';

import Events from './dynamito.events';

function Dyanmito() {
  this.eventListner = new Events();
  this.modelSchemas = {};
}

Dyanmito.prototype.configure = Core.configure;
Dyanmito.prototype.access = Access;
Dyanmito.prototype.Schema = Schema;
Dyanmito.prototype.Queries = Queries;
Dyanmito.prototype.Finder = Finder;

/**
 * Crete a new model object from an schema.
 * @param name
 * @param schema
 */
Dyanmito.prototype.model = function (name, schema, options) {
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

  return DynamitoModel.compile(name, schema, this, options);
};

export default new Dyanmito();
