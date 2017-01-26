/* eslint max-nested-callbacks:0 no-new:0 */
import async from 'async';

// Creting a model to this tests.
import Dynamito from '../lib';

import AllValuesSchema from './mocks/allvalues.model.mock.js';
var AllValuesModel;

import Basic from './mocks/basic.schema.mock.js';

function saveObject(obj) {
  return next => {
    AllValuesModel
      .create(obj)
      .then(() => next())
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

describe('Dynamito Basic Schema Types', () => {
  before(() => {
    AllValuesModel = Dynamito.model('AllValues', AllValuesSchema);
    return AllValuesModel.scan().removeAll();
  });

  after(() => {
    return AllValuesModel.scan().removeAll();
  });

  describe('Values Conversion', () => {
    it('should check if saved String is returned from gets', done => {
      async.waterfall([
        saveObject({
          id: '0001',
          name: 'Asgard'
        }),
        checkObject('0001', [{
          field: 'id',
          value: '0001'
        }, {
          field: 'name',
          value: 'Asgard'
        }])
      ], done);
    });

    it('should check if saved Number is returned from gets', done => {
      async.waterfall([
        saveObject({
          id: '0002',
          age: 42
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

    it('should check if saved Object is returned from gets', done => {
      async.waterfall([
        saveObject({
          id: '0003',
          structure: {
            table: 'Person',
            attribute: 'name'
          }
        }),
        checkObject('0003', [{
          field: 'id',
          value: '0003'
        }, {
          field: 'structure',
          value: {
            table: 'Person',
            attribute: 'name'
          }
        }])
      ], done);
    });

    it('should check if saved Boolean is returned from gets', done => {
      // Note: This will, one day, be a nested structure instead of object type.
      async.waterfall([
        saveObject({
          id: '0004',
          active: false
        }),
        checkObject('0004', [{
          field: 'id',
          value: '0004'
        }, {
          field: 'active',
          value: false
        }])
      ], done);
    });

    it('should check if saved Date is returned from gets', done => {
      // Note: This will, one day, be a nested structure instead of object type.
      async.waterfall([
        saveObject({
          id: '0005',
          birthDate: new Date(2000, 1, 1)
        }),
        checkObject('0005', [{
          field: 'id',
          value: '0005'
        }, {
          field: 'birthDate',
          value: new Date(2000, 1, 1)
        }])
      ], done);
    });
  });

  describe('Dynamito Keys', () => {
    describe('HASH validation: ', () => {
      it('should have at least one HASH(keyType) attribute', () => {
        expect(() => {
          new Dynamito.Schema(Basic.BasicSchema);
        }).not.to.throw();
      });

      it('should not create a schema when no HASH(keyType) is found', () => {
        expect(() => {
          new Dynamito.Schema(Basic.BasicWrongSchemaWithoutHash);
        }).to.throw('Hash has not been defined.');
      });

      it('should not create a schema with two or more HASH(keyType)', () => {
        expect(() => {
          new Dynamito.Schema(Basic.BasicWrongSchemaWithoutTwoHashes);
        }).to.throw('More than one hash has been defined.');
      });
    });

    describe('RANGE validation: ', () => {
      it('should accept RANGE as valid keyType', () => {
        expect(() => {
          new Dynamito.Schema(Basic.BasicSchemaWithRange);
        }).not.to.throw();
      });

      it('should not accept more than one RANGE as keyType', () => {
        expect(() => {
          new Dynamito.Schema(Basic.BasicSchemaWithMoreThanOneRange);
        }).to.throw('More than one range has been defined.');
      });
    });

    describe('Validating field types:', () => {
      it('should accept available types, nested or not', () => {
        expect(() => {
          new Dynamito.Schema({
            id: {
              type: String,
              keyType: Dynamito.Schema.Types.HASH
            },
            name: String,
            age: {
              type: Number
            }
          });
        }).not.to.throw();
      });
    });
  });
});
