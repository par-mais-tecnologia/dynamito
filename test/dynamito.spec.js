/* eslint max-nested-callbacks:0 */
import Dynamito from '../lib';
import DeletableSchema from './mocks/deletable.model.mock';

var DeletableModel;

describe('Dynamito Root Feature Access:', () => {
  before(() => {
    DeletableModel = Dynamito.model('Deletable', DeletableSchema);
  });

  it('should create a table by its model', done => {
    DeletableModel
      .createTable()
      .then(() => {
        Dynamito
          .access
          .listTables()
          .then(res => {
            expect(res.indexOf('Test-Deletable')).not.to.be.equal(-1);
            done();
          })
          .catch(done);
      })
      .catch(done);
  });

  describe('deleting tables', () => {
    before(() => {
      return DeletableModel.createTable();
    });

    it('should delete a table by its model', done => {
      DeletableModel
        .deleteTable()
        .then(() => {
          Dynamito
            .access
            .listTables()
            .then(res => {
              expect(res.indexOf('Test-Deletable')).to.be.equal(-1);
              done();
            })
            .catch(done);
        })
        .catch(done);
    });
  });

  describe('listing tables', () => {
    before(() => {
      return DeletableModel.createTable();
    });
    after(() => {
      return DeletableModel.deleteTable();
    });

    it('should list all tables', done => {
      Dynamito
        .access
        .listTables()
        .then(res => {
          expect(res.indexOf('Test-Deletable')).not.to.be.equal(-1);
          done();
        })
        .catch(done);
    });
  });
});
