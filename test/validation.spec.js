import Dynamito from '../lib';

import PersonSchema from './mocks/person.model.mock.js';
var PersonModel;

describe('Dynamito Custom Validations: ', () => {
  before(() => {
    PersonModel = Dynamito.model('Person', PersonSchema);
  });
  beforeEach(() => {
    return PersonModel.scan().removeAll();
  });
  after(() => {
    return PersonModel.scan().removeAll();
  });

  describe('Native DynamoDB Validations', () => {
    it('should not save with HASH key undefined', done => {
      var input = {
        email: undefined,
        name: 'Derpy',
        last: 'Lancaster',
        age: 32
      };

      PersonModel
        .create(input)
        .then(() => {
          // Dont want to fall here.
          expect(false).to.be.equal(true);
        })
        .catch(err => {
          expect(err).to.be.equal('A keys was not given a value: email');
          done();
        });
    });
  });

  describe('Basic Validation Features', () => {
    it('should be accepted by validations', done => {
      var input = {
        email: 'some.email@target.com',
        name: 'Derty',
        last: 'Lancotre',
        age: 42
      };

      PersonModel
        .create(input)
        .then(data => {
          // Dont want to fall here.
          expect(data.toJSON().email).to.be.equal(input.email);
          expect(data.toJSON().name).to.be.equal(input.name);
          expect(data.toJSON().last).to.be.equal(input.last + '!');
          expect(data.toJSON().age).to.be.equal(input.age);
          done();
        })
        .catch(done);
    });

    it('should invalidate input based on custom validation', done => {
      var input = {
        email: 'some.email@target.com',
        name: 'Der',
        last: 'Lancotre',
        age: 32
      };

      PersonModel
        .create(input)
        .then(() => {
          // Dont want to fall here.
          expect(false).to.be.equal(true);
        })
        .catch(err => {
          expect(err).to.be.equal('Name cannot be lesser than 4 character');
          done();
        });
    });

    it('should validate required fields', done => {
      var input = {
        email: 'some.email@target.com',
        name: 'Derty',
        last: 'Lancotre'
      };

      PersonModel
        .create(input)
        .then(() => {
          // Dont want to fall here.
          expect(false).to.be.equal(true);
        })
        .catch(err => {
          expect(err).to.be.equal('Required field: age');
          done();
        });
    });

    it('should accept required fields when set', done => {
      var input = {
        email: 'some.email@target.com',
        name: 'Derty',
        last: 'Lancotre',
        age: 32
      };

      PersonModel
        .create(input)
        .then(data => {
          expect(data.toJSON().email).to.be.equal(input.email);
          expect(data.toJSON().name).to.be.equal(input.name);
          expect(data.toJSON().last).to.be.equal(input.last + '!');
          expect(data.toJSON().age).to.be.equal(input.age);
          done();
        })
        .catch(done);
    });
  });

  describe('Validation Advanced Features', () => {
    it('should accept a callback to create async validations', done => {
      var input = {
        email: 'some.email@target.com',
        name: 'Derty',
        last: 'Lancotre Irrelevant',
        age: 32
      };

      PersonModel
        .create(input)
        .then(() => {
          // Dont want to fall here.
          expect(false).to.be.equal(true);
        })
        .catch(err => {
          expect(err).to.be.equal('Last Name cannot be larger than 10 character');
          done();
        });
    });
  });
});
