import Dynamito from '../lib';
import ThingSchema from './mocks/thing.mock';

var Thing;

describe('Dynamito Remove Fields: ', () => {
  before(() => {
    Thing = Dynamito.model('Thing', ThingSchema);
  });
  beforeEach(() => {
    return Thing.scan().removeAll();
  });
  beforeEach(done => {
    var input = [{
      name: 'New Thing',
      info: 'This is an Awsome Thing',
      extra: 'A',
      active: true
    }, {
      name: 'Another Thing',
      info: 'This is an Awfull Thing',
      extra: 'B',
      active: true
    }, {
      name: 'Inefficient Thing',
      info: 'This is an ignorant thing',
      extra: 'C',
      active: false
    }];

    return Thing.create(input).then(() => done());
  });
  after(() => {
    return Thing.scan().removeAll();
  });

  it('should scan a table ignoring a list of fields', done => {
    Thing
      .scan()
      .fields(['-info', '-active'])
      .exec()
      .then(res => {
        expect(res[0].active).to.be.equal(undefined);
        expect(res[1].active).to.be.equal(undefined);
        expect(res[2].active).to.be.equal(undefined);

        expect(res[0].info).to.be.equal(undefined);
        expect(res[1].info).to.be.equal(undefined);
        expect(res[2].info).to.be.equal(undefined);

        expect(res[0].name).not.to.be.equal(undefined);
        expect(res[1].name).not.to.be.equal(undefined);
        expect(res[2].name).not.to.be.equal(undefined);

        done();
      })
      .catch(done);
  });

  it('should find an item ignoring a list of fields', done => {
    Thing
      .findById('Another Thing')
      .fields(['-info', '-active'])
      .exec()
      .then(res => {
        expect(res.active).to.be.equal(undefined);
        expect(res.info).to.be.equal(undefined);
        expect(res.name).not.to.be.equal(undefined);
        done();
      })
      .catch(done);
  });
});
