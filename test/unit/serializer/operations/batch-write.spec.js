
import * as BatchWrite from '../../../../lib/serializer/operations/batch-write.js';

describe('Dynamito Operations - Batch Write: ', () => {
  it('should return values not to crash when called', () => {
    expect(BatchWrite.batchWriteReturnValues()).not.to.throw();
  });

  it('should convert an array of documents to Dynamo Model.', () => {
    var toDynamo = BatchWrite.batchWriteSchemaToDynamo();

    var output = {
      TableName: 'Some Fake Table'
    };
    toDynamo([{
      toJSON: () => {
        return 'A';
      }
    }, {
      toJSON: () => {
        return 'B';
      }
    }], output);

    expect(output).to.deep.equal({
      RequestItems: {
        'Some Fake Table': [
          {PutRequest: {Item: 'A'}},
          {PutRequest: {Item: 'B'}}
        ]
      }
    });
  });

  describe('posvalidation and Dynamo Throttling', () => {
    var sandbox;
    var clock;
    before(() => {
      sandbox = sinon.sandbox.create();
      clock = sandbox.useFakeTimers();
    });
    after(() => {
      sandbox.restore();
    });

    it('should pos validate a commom batch write request', done => {
      var posValidation = BatchWrite.posValidation();
      var result = {UnprocessedItems: {}};
      posValidation({}, '', 'Some Fake Table', {}, result, () => {
        done();
      });
    });

    it('should pos validate batch write request with unprocessed items', done => {
      var posValidation = BatchWrite.posValidation();

      var resultUnprocessed = {UnprocessedItems: {
        'Some Fake Table': {}
      }};
      var resultProcessed = {UnprocessedItems: {}};
      var executor = {
        put: (a, cb) => {
          cb(null, resultProcessed);
        }
      };

      posValidation(executor, 'put', 'Some Fake Table', {}, resultUnprocessed, err => {
        expect(err).to.be.equal(null);
        done();
      });

      clock.tick(5000);
    });

    it('should error abort a pos validate batch write request with unprocessed items', done => {
      var posValidation = BatchWrite.posValidation();

      var resultUnprocessed = {UnprocessedItems: {
        'Some Fake Table': {}
      }};
      var resultProcessed = {UnprocessedItems: {}};
      var executor = {
        put: (a, cb) => {
          cb(new Error('Fake Error'), resultProcessed);
        }
      };

      posValidation(executor, 'put', 'Some Fake Table', {}, resultUnprocessed, err => {
        expect(err).not.to.be.equal(null);
        done();
      });

      clock.tick(5000);
    });
  });
});
