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

  it('should accept additional fields when configured', () => {
    return sample.save().then(saved => {
      const item = saved.toJSON();
      expect(item).to.deep.equal({
        email: 'some.email@target.com',
        name: 'Derpy',
        last: 'Lancotre!',
        age: 42,
        password: '123456789',
        someAdditionalField: 'Additional Data',
        someExtraAdditionalField: 'Extra Data',
      });
    });
  });
});
