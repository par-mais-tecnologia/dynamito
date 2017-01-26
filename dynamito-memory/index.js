import winston from 'winston';

import Document from './document';
import Database from './db';

import process from 'process';

export default function DynamitoMemory() {
  DynamitoMemory.DocumentClient.Parent = this;

  this._db = new Database();
}

DynamitoMemory.DocumentClient = Document;

DynamitoMemory.prototype.db = function () {
  return this._db;
};

DynamitoMemory.prototype.listTables = function (data, callback) {
  winston.silly('Listing tables: ');
  winston.silly(data);
  process.nextTick(callback, null, {
    TableNames: this._db.getTablesNames()
  });
};

DynamitoMemory.prototype.createTable = function (tableData, callback) {
  winston.silly('Creating tables: ');
  winston.silly(tableData);
  this._db.createTable(tableData.TableName, tableData);
  process.nextTick(callback, null, tableData);
};

DynamitoMemory.prototype.deleteTable = function (tableData, callback) {
  winston.silly('Deleting tables: ');
  winston.silly(tableData);
  this._db.deleteTable(tableData.TableName);
  process.nextTick(callback, null, tableData.TableName);
};
