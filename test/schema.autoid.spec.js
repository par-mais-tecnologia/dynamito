import Dynamito from '../lib';

import * as Utils from '../lib/dynamito.utils';

import AutoIdSchema from './mocks/autoid.model.mock.js';
var AutoIdmodel;

var sample;
function genSample() {
  sample = new AutoIdmodel({
    name: 'Some Awsome Name',
    age: '42'
  });
  return sample;
}

describe('Dynamito Auto Ids: ', () => {
  before(() => {
    AutoIdmodel = Dynamito.model('AutoId', AutoIdSchema);
  });
  beforeEach(() => {
    return AutoIdmodel.scan().removeAll();
  });
  beforeEach(() => genSample());
  after(() => {
    return AutoIdmodel.scan().removeAll();
  });

  describe('Automatically generating IDs', () => {
    it('should auto generate an ID', done => {
      sample.save().then(saved => {
        expect(saved.id).not.to.be.equal(undefined);
        done();
      }).catch(done);
    });
  });

  describe('repeated ids', () => {
    var generator = {
      internal: 0,
      reset: function () {
        this.internal = 0;
      },
      generate: function (count) {
        var self = this;
        return () => {
          self.internal++;
          if (self.internal >= count) {
            return '0002';
          }
          return '0001';
        };
      }
    };

    var sandbox;
    before(() => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(Utils, 'generateId', generator.generate(5));
    });
    beforeEach(() => {
      console.log(generator);
      generator.reset();
    });
    after(() => {
      sandbox.restore();
    });

    it('should not repeat an ID', done => {
      return sample.save().then(() => {
        genSample();
        return sample.save().then(() => {
          return sample.scan().exec().then(data => {
            expect(data.length).to.be.equal(2);
            done();
          });
        });
      });
    });
  });
});
