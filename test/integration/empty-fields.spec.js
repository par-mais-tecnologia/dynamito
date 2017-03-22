import Dynamito from '../../lib';
import PersonSchema from '../mocks/person.model.mock.js';

var PersonModel;

var sample;
function genSample() {
  sample = new PersonModel({
    email: 'some.email@target.com',
    name: 'Derpy',
    last: 'Lancotre',
    age: 42,
    password: '1234',
    ocupation: ''
  });
  return sample;
}

describe('Dynamito Empty Fields: ', () => {
  before(() => {
    PersonModel = Dynamito.model('Person', PersonSchema);
    return PersonModel.scan().removeAll();
  });
  beforeEach(() => {
    genSample();
  });
  after(() => {
    return PersonModel.scan().removeAll();
  });

  it('should save objects with empty string fields', () => {
    // Aka: ''
    return sample.save().should.not.be.rejected;
  });

  it('should not save objects with empty string fields when this field is a key', () => {
    sample.email = '';
    return sample.save().should.be.rejectedWith('A keys was not given a value: email');
  });
});
