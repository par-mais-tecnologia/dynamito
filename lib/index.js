/**
 * Amazon Wrap to manipulate models at DynamoDb
 */

import DynamitoModel from './dynamito.model';
import Schema from './dynamito.schema';
import { configure } from './dynamito.core';
import * as Queries from './dynamito.queries';
import * as Access from './dynamito.access';
import Finder from './dynamito.finder';

import Events from './dynamito.events';

class Dyanmito {
  configure = configure;
  access = Access;
  Schema = Schema;
  Queries = Queries;
  Finder = Finder;

  constructor() {
    this.eventListner = new Events();
    this.modelSchemas = {};
  }

  /**
   * Crete a new model object from an schema.
   * @param name
   * @param schema
   */
  model(name, schema, options) {
    // look up schema for the collection.
    if (!this.modelSchemas[name]) {
      if (schema) {
        // cache it so we only apply plugins once
        this.modelSchemas[name] = schema;
      } else {
        throw new Error(`Missing Schema: ${name}`);
      }
    }

    // ensure a schema exists
    if (!schema) {
      schema = this.modelSchemas[name];
      if (!schema) {
        throw new Error(`Missing Schema: ${name}`);
      }
    }

    return DynamitoModel.compile(name, schema, this, options);
  }
}

export default new Dyanmito();
