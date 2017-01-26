import async from 'async';

// Creting a model to this tests.
import Dynamito from '../lib';

import AllValuesSchema from './mocks/allvalues.model.mock.js';
var AllValuesModel;

function saveObject(obj) {
  return next => {
    AllValuesModel
      .create(obj)
      .then(() => {
        next();
      })
      .catch(next);
  };
}

function checkObject(id, validations) {
  return next => {
    AllValuesModel
      .findById(id)
      .exec()
      .then(data => {
        validations.forEach(it => {
          expect(data[it.field]).to.deep.equal(it.value);
        });
        next();
      })
      .catch(next);
  };
}

describe('Dynamito Basic Schema Values', () => {
  before(() => {
    AllValuesModel = Dynamito.model('AllValues', AllValuesSchema);
    return AllValuesModel.scan().removeAll();
  });

  after(() => {
    return AllValuesModel.scan().removeAll();
  });

  it('should save on number format', done => {
    async.waterfall([
      saveObject({
        id: '0002',
        age: '42'
      }),
      checkObject('0002', [{
        field: 'id',
        value: '0002'
      }, {
        field: 'age',
        value: 42
      }])
    ], done);
  });
});
