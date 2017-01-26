import Dynamito from '../lib';
import ThingSchema from './mocks/thing.mock';

var ThingModel;

describe('Dynamito Fields Helpers: ', () => {
  before(() => {
    ThingModel = Dynamito.model('Thing', ThingSchema);
  });
  beforeEach(() => {
    return ThingModel.scan().removeAll();
  });
  after(() => {
    return ThingModel.scan().removeAll();
  });

  describe('Creating new Objects with field configurations', () => {
    it('should save lowercase field when configured', done => {
      var input = {
        name: 'New Thing',
        info: 'This is an Awsome Thing',
        active: true
      };

      ThingModel
        .create(input)
        .then(data => {
          expect(data.info).to.be.equal('This is an Awsome Thing');
          done();
        })
        .catch(done);
    });

    it('should save default values when configured', done => {
      var input = {
        name: 'New Thing',
        info: 'This is an Awsome Thing'
      };

      ThingModel
        .create(input)
        .then(data => {
          expect(data.active).to.be.equal(false);
          done();
        })
        .catch(done);
    });

    it('should ignore default values when configured and inputted', done => {
      var input = {
        name: 'New Thing',
        info: 'This is an Awsome Thing',
        active: true
      };

      ThingModel
        .create(input)
        .then(data => {
          expect(data.active).to.be.equal(true);
          done();
        });
    });
  });
});
