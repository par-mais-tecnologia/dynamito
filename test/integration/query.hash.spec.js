import Dynamito from '../../lib';
import AllValues from '../mocks/allvalues.model.mock';
import NumederIdSchema from '../mocks/numeredid.model.mock';

var AllValuesModel;
var NumeredId;

var genValues = () => {
  return AllValuesModel.create([{
    id: '0007',
    name: 'Some Name',
    age: 50
  }, {
    id: '0008',
    name: 'Some Other Name',
    age: 5
  }, {
    id: '0009',
    name: 'Some One',
    age: 5
  }, {
    id: '0077',
    name: 'James Bond',
    age: 50
  }, {
    id: '0078',
    name: 'Rainha Elizabeth',
    age: 30
  }, {
    id: '0079',
    name: 'Turin Lacoix',
    age: 80
  }]);
};

var getNumbers = () => {
  return NumeredId.create([{
    id: 0,
    description: 'Zero',
    active: true,
    index: 0
  }, {
    id: 1,
    description: 'One',
    active: true,
    index: 1
  }, {
    id: 2,
    description: 'Two',
    active: false,
    index: 2
  }, {
    id: 10,
    description: 'Ten',
    active: true,
    index: 3
  }, {
    id: 20,
    description: 'Twelve',
    active: true,
    index: 4
  }]);
};

describe('Query Finders on HASH', () => {
  describe('GETs', () => {
    before(() => {
      AllValuesModel = Dynamito.model('AllValues', AllValues);
    });
    beforeEach(() => {
      return AllValuesModel.scan().removeAll();
    });
    beforeEach(() => {
      return genValues();
    });
    after(() => {
      return AllValuesModel.scan().removeAll();
    });

    it('should find and element by its ID', done => {
      return AllValuesModel
        .findById('0078')
        .exec()
        .then(res => {
          expect(res.toJSON()).to.deep.equal({
            id: '0078',
            name: 'Rainha Elizabeth',
            age: 30
          });
          done();
        })
        .catch(done);
    });
  });

  describe('QUERYs', () => {
    before(() => {
      NumeredId = Dynamito.model('NumeredId', NumederIdSchema);
    });
    beforeEach(() => {
      return NumeredId.scan().removeAll();
    });
    beforeEach(() => {
      return getNumbers();
    });
    after(() => {
      return NumeredId.scan().removeAll();
    });

    it('should query for exact id (Equal)', done => {
      return NumeredId
        .query()
        .find(new Dynamito.Queries.Equal('id', 1))
        .exec()
        .then(res => {
          expect(res.length).to.be.equal(1);
          expect(res[0].toJSON()).to.deep.equal({
            id: 1,
            description: 'One',
            active: true,
            index: 1
          });
          done();
        })
        .catch(done);
    });
  });
});
