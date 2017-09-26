/**
 * Class to control restric acces to dynamo documento operations.
 */

// SERIALIZER
import * as serializer from './dynamito.serializer';
// COMMOM OPERATION
import * as getitems from './commom/getitems';

// PUT
import * as put from './operations/put';
// UPDATE
import * as update from './operations/update';
// GET
import * as get from './operations/get';
// SCAN
import * as scan from './operations/scan';
// QUERY
import * as query from './operations/query';
// DELETE
import * as del from './operations/delete';
// BATCH_WRITE
import * as batch from './operations/batch-write';

// PUT
serializer.addMiddleware('put', 'pre', put.putSchemaToDynamo());
serializer.addMiddleware('put', 'pos', put.putReturnValues());

// UPDATE
serializer.addMiddleware('update', 'pre', update.updateSchemaToDynamo());
serializer.addMiddleware('update', 'pos', update.updateReturnValues());

// GET
serializer.addMiddleware('get', 'pre', get.getSchemaToDynamo());
serializer.addMiddleware('get', 'pos', getitems.getSingle());

// SCAN
serializer.addMiddleware('scan', 'pre', scan.scanSchemaToDynamo());
serializer.addMiddleware('scan', 'pos', getitems.getArray());
serializer.addMiddleware('scan', 'pos', getitems.sortArray());
serializer.setPosValidation('scan', getitems.posScanValidation());

// QUERY
serializer.addMiddleware('query', 'pre', query.querySchemaToDynamo());
serializer.addMiddleware('query', 'pos', getitems.getArray());

// DELETE
serializer.addMiddleware('delete', 'pre', del.deleteSchemaToDynamo());
serializer.addMiddleware('delete', 'pos', del.deleteReturnValues());

// BATCH_WRITE
serializer.addMiddleware('batchWrite', 'pre', batch.batchWriteSchemaToDynamo());
serializer.addMiddleware('batchWrite', 'pos', batch.batchWriteReturnValues());
serializer.setPosValidation('batchWrite', batch.posValidation());

// BATCH_GET
// var batchGet = require('./operations/batch-get');
// serializer.addMiddleware('batchGet', 'pre', batchGet.batchGetSchemaToDynamo());
// serializer.addMiddleware('batchGet', 'pos', batchGet.batchGetReturnValues());
// serializer.setPosValidation('batchGet', batchGet.batchGetPosValidation());

export const initialize = serializer.initialize;
export const table = serializer.table;
