import waterfall from 'async/waterfall';

import Dynamito from '../lib';
import PersonSchema from './mocks/person.model.mock.js';

var PersonModel;

describe('Dynamito Document Features: ', () => {
  before(() => {
    PersonModel = Dynamito.model('Person', PersonSchema);
  });
  beforeEach(() => {
    return PersonModel.scan().removeAll();
  });
  after(() => {
    return PersonModel.scan().removeAll();
  });

  describe('Direct Operations', () => {
    it('should save a document', done => {
      var input = {
        email: 'some.email@target.com',
        name: 'Derpy',
        last: 'Lancotre',
        age: 42,
        password: '1234'
      };

      waterfall([next => {
        // Create
        PersonModel
          .create(input)
          .then(data => {
            expect(data.toJSON().email).to.be.equal(input.email);
            expect(data.toJSON().name).to.be.equal(input.name);
            expect(data.toJSON().age).to.be.equal(input.age);
            expect(data.toJSON().password).to.be.equal(input.password + '56789');
            next();
          }).catch(done);
      }, next => {
        // GET
        PersonModel
          .findById(input.email)
          .exec()
          .then(data => {
            next(null, data);
          }).catch(done);
      }, (data, next) => {
        // Change and save
        expect(data.toJSON().email).to.be.equal(input.email);
        expect(data.toJSON().name).to.be.equal(input.name);
        expect(data.toJSON().age).to.be.equal(input.age);
        expect(data.toJSON().password).to.be.equal(input.password + '56789');
        data.name = 'Erasmo';
        data
          .save()
          .then(() => {
            next();
          }).catch(done);
      }, next => {
        // GET
        PersonModel
          .findById(input.email)
          .exec()
          .then(data => {
            expect(data.name).to.be.equal('Erasmo');
            next(null);
          }).catch(done);
      }], done);
    });
  });

  describe('Document Modifications', () => {
    it('should throw error when checking for modification on invalid fields', done => {
      var input = {
        email: 'some.email@target.com',
        name: 'Derpy',
        last: 'Lancotre',
        age: 42
      };

      PersonModel
        .create(input)
        .then(data => {
          expect(() => {
            data.isModified('unknownField');
          }).to.throw('Invalid Field: unknownField');
          done();
        }).catch(done);
    });

    it('should be identified as modified on creation', done => {
      var input = {
        email: 'some.email@target.com',
        name: 'Derpy',
        last: 'Lancotre',
        age: 42,
        password: '1234'
      };

      PersonModel
        .create(input)
        .then(data => {
          expect(data.isModified('name')).to.be.equal(true);
          expect(data.toJSON().name).to.be.equal(input.name);
          expect(data.toJSON().age).to.be.equal(input.age);
          expect(data.toJSON().password).to.be.equal(input.password + '56789');
          done();
        }).catch(done);
    });

    it('should be identified when chaged', done => {
      var input = {
        email: 'some.email@target.com',
        name: 'Derpy',
        last: 'Lancotre',
        age: 42
      };

      waterfall([next => {
        PersonModel
          .create(input)
          .then(data => {
            expect(data.toJSON().name).to.deep.equal(input.name);
            expect(data.toJSON().age).to.deep.equal(input.age);
            next();
          }).catch(done);
      }, next => {
        PersonModel
          .findById(input.email)
          .exec()
          .then(result => {
            expect(result.toJSON().name).to.deep.equal(input.name);
            expect(result.toJSON().age).to.deep.equal(input.age);
            next(null, result);
          }).catch(done);
      }], (err, instance) => {
        expect(instance.isModified('name')).to.be.equal(false);
        instance.name = 'Some Fake Name';
        expect(instance.isModified('name')).to.be.equal(true);
        done(err);
      });
    });
  });
});
