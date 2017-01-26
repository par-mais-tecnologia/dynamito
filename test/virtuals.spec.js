import Dynamito from '../lib';
import PersonSchema from './mocks/person.model.mock.js';

var Person;

describe('Dynamito Virtual Access: ', () => {
  before(() => {
    Person = Dynamito.model('Person', PersonSchema);
  });
  beforeEach(() => {
    return Person.scan().removeAll();
  });
  after(() => {
    return Person.scan().removeAll();
  });

  it('should access virtual attributes', done => {
    var input = {
      email: 'some.email@target.com',
      name: 'Derpy',
      last: 'Lancotre',
      age: 90
    };

    Person
      .create(input)
      .then(data => {
        expect(data.full).to.be.equal('Derpy Lancotre');
        expect(data.email).to.be.equal(input.email);
        expect(data.name).to.be.equal(input.name);
        expect(data.last).to.be.equal('Lancotre!');
        expect(data.age).to.be.equal(input.age);
        done();
      })
      .catch(done);
  });

  it('should virtual never be serialized', done => {
    var input = {
      email: 'some.email@target.com',
      name: 'Derpy',
      last: 'Lancotre',
      age: 90
    };

    Person
      .create(input)
      .then(data => {
        expect(data.full).to.be.equal('Derpy Lancotre');
        expect(data.toJSON().full).to.be.equal(undefined);
        done();
      })
      .catch(done);
  });
});
