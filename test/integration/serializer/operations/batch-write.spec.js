
import crypto from 'crypto';

import Dynamito from '../../../../lib';
import ThingSchema from '../../../mocks/thing.mock';

var ThingModel;

var thingsArrays;
function genArrays(N) {
  thingsArrays = [];
  for (var i = 0; i < N; i++) {
    thingsArrays.push({
      name: 'Thing: ' + i,
      info: crypto.randomBytes(8).toString('hex'),
      active: true
    });
  }
}

describe('Creating new Objects with "createMany" operation', () => {
  before(() => {
    ThingModel = Dynamito.model('Thing', ThingSchema);
  });
  beforeEach(() => {
    return ThingModel.scan().removeAll();
  });
  beforeEach(() => genArrays(10));
  after(() => {
    return ThingModel.scan().removeAll();
  });

  it('should create a lot of objects', done => {
    return ThingModel
      .createMany(thingsArrays)
      .then(() => {
        ThingModel
          .scan()
          .exec()
          .then(res => {
            expect(res.length).to.be.equal(10);
            done();
          })
          .catch(done);
      })
      .catch(done);
  });
});
