import Dynamito from '../../lib';
import AllValues from '../mocks/allvalues.model.mock';

var AllValuesModel;

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
    name: 'Some Name',
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

describe('Scan Filters (Queries)', () => {
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

  it('should scan for objects', () => {
    return AllValuesModel
      .scan()
      .exec()
      .then(red => {
        expect(red.map(it => it.toJSON())).to.deep.equal([{
          age: 50,
          id: '0007',
          name: 'Some Name'
        }, {
          age: 5,
          id: '0008',
          name: 'Some Other Name'
        }, {
          age: 5,
          id: '0009',
          name: 'Some Name'
        }, {
          age: 50,
          id: '0077',
          name: 'James Bond'
        }, {
          age: 30,
          id: '0078',
          name: 'Rainha Elizabeth'
        }, {
          age: 80,
          id: '0079',
          name: 'Turin Lacoix'
        }]);
      });
  });
});
