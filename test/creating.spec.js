/* eslint max-nested-callbacks:0 */
import crypto from 'crypto';

import Dynamito from '../lib';
import ThingSchema from './mocks/thing.mock';

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

describe('Dynamito Model Access: ', () => {
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

  describe('Creating new Objects with "createOne" operation', () => {
    it('should create an object', done => {
      var input = {
        name: 'New Thing',
        info: 'This is an Awsome Thing',
        active: true
      };
      return ThingModel
        .createOne(input)
        .then(res => {
          ThingModel
            .findById(res.name)
            .exec()
            .then(found => {
              expect(found.toJSON()).to.deep.equal(input);
              done();
            })
            .catch(done);
        })
        .catch(done);
    });
  });

  describe('Creating new Objects with general "create" operation', () => {
    it('should create a thing, and receive its Document on result', done => {
      var input = {
        name: 'New Thing',
        info: 'This is an Awsome Thing',
        active: true
      };
      ThingModel
        .create(input)
        .then(res => {
          ThingModel
            .findById(res.name)
            .exec()
            .then(found => {
              expect(found.toJSON()).to.deep.equal(input);
              done();
            })
            .catch(done);
        })
        .catch(done);
    });

    it('should create a lot of objects', done => {
      return ThingModel
        .create(thingsArrays)
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

  describe('create new things with new operator', () => {
    it('should create a thing, and receive its Document on result', done => {
      var input = {
        name: 'New Thing',
        info: 'This is an Awsome Thing',
        active: true
      };

      var wwac = {
        name: 'New Thing',
        info: 'This is an Awsome Thing',
        active: true
      };
      var nt = new ThingModel(wwac);
      nt.save()
        .then(res => {
          ThingModel
            .findById(res.name)
            .exec()
            .then(found => {
              expect(found.toJSON()).to.deep.equal(input);
              done();
            })
            .catch(done);
        })
        .catch(done);
    });

    it('should not change input object', done => {
      var comparator = {
        name: 'Polanski',
        info: 'This is an Awsome Thing',
        active: true
      };

      var wwac = {
        name: 'New Thing',
        info: 'This is an Awsome Thing',
        active: true
      };
      var nt = new ThingModel(wwac);
      nt.name = 'Polanski';
      nt.save()
        .then(res => {
          ThingModel
            .findById(res.name)
            .exec()
            .then(found => {
              expect(found.toJSON()).to.deep.equal(comparator);
              expect(wwac.name).to.be.equal('New Thing');
              done();
            })
            .catch(done);
        })
        .catch(done);
    });
  });

  describe('specific conditions', () => {
    it('should types be enforced on demand', done => {
      var data = {
        name: 'Polanski',
        info: 'This is an Awsome Thing',
        active: true,
        date: '2016-02-01T02:00:00.000Z'
      };

      var nt = new ThingModel(data);
      nt.enforceTypes();
      nt.cacheField();

      expect(typeof nt.date).to.be.equal('object');

      done();
    });
  });
});
