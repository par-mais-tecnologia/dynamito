import Dynamito from '../../lib';
import PersonSchema from '../mocks/person.model.mock.js';

let PersonModel;

let sample;
function genSample() {
  sample = new PersonModel({
    email: 'some.email@target.com',
    name: 'Derpy',
    last: 'Lancotre',
    age: 42,
    password: '1234',
    ocupation: '',

    someAdditionalField: 'Additional Data',
    someExtraAdditionalField: 'Extra Data',
  });
  return sample;
}

describe('Additional Properties Option: ', () => {
  before(() => {
    PersonModel = Dynamito.model('PersonAdditional', PersonSchema, {
      additionalProperties: true,
    });
    return PersonModel.scan().removeAll();
  });

  beforeEach(() => genSample());

  describe('Saving: ', () => {
    afterEach(() => {
      return PersonModel
        .scan()
        .exec()
        .then(data => {
          expect(data.length).to.be.equal(1);
          expect(data[0].toJSON()).to.deep.equal({
            email: 'some.email@target.com',
            name: 'Derpy',
            last: 'Lancotre',
            age: 42,
            password: '123456789',
            someAdditionalField: 'Additional Data',
            someExtraAdditionalField: 'Extra Data',
          });
          return null;
        });
    });

    it('should save additional fields when configured - PUT', () => {
      return sample.save();
    });
  });

  describe('Getting: ', () => {
    beforeEach(() => sample.save());

    it('should get additional fields on SCAN', () => {
      return PersonModel
        .scan()
        .exec()
        .then(data => {
          expect(data.length).to.be.equal(1);
          expect(data[0].toJSON()).to.deep.equal({
            email: 'some.email@target.com',
            name: 'Derpy',
            last: 'Lancotre',
            age: 42,
            password: '123456789',
            someAdditionalField: 'Additional Data',
            someExtraAdditionalField: 'Extra Data',
          });
          return null;
        });
    });

    it('should get additional fields on GET', () => {
      return PersonModel
        .findById('some.email@target.com')
        .exec()
        .then(data => {
          expect(data.toJSON()).to.deep.equal({
            email: 'some.email@target.com',
            name: 'Derpy',
            last: 'Lancotre',
            age: 42,
            password: '123456789',
            someAdditionalField: 'Additional Data',
            someExtraAdditionalField: 'Extra Data',
          });
          return null;
        });
    });

    it('should get additional fields on QUERY', () => {
      return PersonModel
        .query()
        .find(new PersonModel.Queries.Equal('email', 'some.email@target.com'))
        .exec()
        .then(data => {
          expect(data.length).to.be.equal(1);
          expect(data[0].toJSON()).to.deep.equal({
            email: 'some.email@target.com',
            name: 'Derpy',
            last: 'Lancotre',
            age: 42,
            password: '123456789',
            someAdditionalField: 'Additional Data',
            someExtraAdditionalField: 'Extra Data',
          });
          return null;
        });
    });
  });
});
