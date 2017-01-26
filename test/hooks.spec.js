import Dynamito from '../lib';
import PersonSchema from './mocks/person.model.mock.js';

var PersonModel;

function change(input) {
  return input + '56789';
}

var sample;
function genSample() {
  sample = new PersonModel({
    email: 'some.email@target.com',
    name: 'Derpy',
    last: 'Lancotre',
    age: 42,
    password: '1234'
  });
  return sample;
}

describe('Dynamito Hooks: ', () => {
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

  describe('Pré', () => {
    it('should save on pre saving stage', done => {
      sample
        .save()
        .then(data => {
          expect(data.password).to.deep.equal(change('1234'));
          done();
        })
        .catch(done);
    });
  });

  describe('Post', () => {
    it('should save on post saving stage', done => {
      sample
        .save()
        .then(data => {
          expect(data.last).to.be.equal('Lancotre!');
          done();
        })
        .catch(done);
    });
  });
});
