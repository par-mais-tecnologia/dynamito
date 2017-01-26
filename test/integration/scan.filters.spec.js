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

  describe('single filters', () => {
    it('should filter for age of 50', () => {
      return AllValuesModel
        .scan()
        .find(new Dynamito.Queries.Equal('age', 50))
        .exec().should.eventually.have.length(2);
    });

    it('should filter for lesser than age of 31', () => {
      return AllValuesModel
        .scan()
        .find(new Dynamito.Queries.LT('age', 31))
        .exec().should.eventually.have.length(3);
    });

    it('should filter for equal or lesser than age of 30', () => {
      return AllValuesModel
        .scan()
        .find(new Dynamito.Queries.LTEqual('age', 30))
        .exec().should.eventually.have.length(3);
    });

    it('should filter for greater than age of 50', () => {
      return AllValuesModel
        .scan()
        .find(new Dynamito.Queries.GT('age', 30))
        .exec().should.eventually.have.length(3);
    });

    it('should filter for greater than age of 50', () => {
      return AllValuesModel
        .scan()
        .find(new Dynamito.Queries.GTEqual('age', 30))
        .exec().should.eventually.have.length(4);
    });

    it('should filter for items between 25 and 55', () => {
      return AllValuesModel
        .scan()
        .find(new Dynamito.Queries.Between('age', 25, 55))
        .exec().should.eventually.have.length(3);
    });
  });

  describe('multiple filters', () => {
    it('should filter with multiple filters', () => {
      return AllValuesModel
        .scan()
        .find(new Dynamito.Queries.GTEqual('age', 25))
        .find(new Dynamito.Queries.LTEqual('age', 55))
        .exec().should.eventually.have.length(3);
    });

    it('should filter with multiple filters in different attributes', () => {
      return AllValuesModel
        .scan()
        .find(new Dynamito.Queries.Equal('name', 'Some Name'))
        .find(new Dynamito.Queries.GTEqual('age', 18))
        .exec().should.eventually.have.length(1);
    });
  });
});
