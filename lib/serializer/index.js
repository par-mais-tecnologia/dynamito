/**
 * Class to control restric acces to dynamo documento operations.
 */

'use strict';

var serializer = require('./dynamito.serializer');

// COMMOM OPERATION
var getitems = require('./commom/getitems.js');

// PUT
var put = require('./operations/put');
serializer.addMiddleware('put', 'pre', put.putSchemaToDynamo());
serializer.addMiddleware('put', 'pos', put.putReturnValues());

// UPDATE
var update = require('./operations/update');
serializer.addMiddleware('update', 'pre', update.updateSchemaToDynamo());
serializer.addMiddleware('update', 'pos', update.updateReturnValues());

// GET
var get = require('./operations/get');
serializer.addMiddleware('get', 'pre', get.getSchemaToDynamo());
serializer.addMiddleware('get', 'pos', getitems.getSingle());

// SCAN
var scan = require('./operations/scan');
serializer.addMiddleware('scan', 'pre', scan.scanSchemaToDynamo());
serializer.addMiddleware('scan', 'pos', getitems.getArray());
serializer.addMiddleware('scan', 'pos', getitems.sortArray());
serializer.setPosValidation('scan', getitems.posScanValidation());

// QUERY
var query = require('./operations/query');
serializer.addMiddleware('query', 'pre', query.querySchemaToDynamo());
serializer.addMiddleware('query', 'pos', getitems.getArray());

// DELETE
var del = require('./operations/delete');
serializer.addMiddleware('delete', 'pre', del.deleteSchemaToDynamo());
serializer.addMiddleware('delete', 'pos', del.deleteReturnValues());

// BATCH_WRITE
var batch = require('./operations/batch-write');
serializer.addMiddleware('batchWrite', 'pre', batch.batchWriteSchemaToDynamo());
serializer.addMiddleware('batchWrite', 'pos', batch.batchWriteReturnValues());
serializer.setPosValidation('batchWrite', batch.posValidation());

// BATCH_GET
// var batchGet = require('./operations/batch-get');
// serializer.addMiddleware('batchGet', 'pre', batchGet.batchGetSchemaToDynamo());
// serializer.addMiddleware('batchGet', 'pos', batchGet.batchGetReturnValues());
// serializer.setPosValidation('batchGet', batchGet.batchGetPosValidation());

module.exports = {
  initialize: serializer.initialize,
  table: serializer.table
};
