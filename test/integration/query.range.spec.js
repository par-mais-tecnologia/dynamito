import Dynamito from '../../lib';
import RangeableSchema from '../mocks/rangeable.mock';

var Rangeable;

var genValues = () => {
  return Rangeable.create([{
    name: 'Alabedo',
    date: new Date(2016, 0, 1),
    data: 'Fake Data A'
  }, {
    name: 'Alabedo',
    date: new Date(2016, 1, 1),
    data: 'Fake Data B'
  }, {
    name: 'Alabedo',
    date: new Date(2016, 2, 1),
    data: 'Fake Data C'
  }, {
    name: 'Nigredo',
    date: new Date(2016, 3, 1),
    data: 'Fake Data D'
  }, {
    name: 'Nigredo',
    date: new Date(2016, 4, 1),
    data: 'Fake Data E'
  }, {
    name: 'Nigredo',
    date: new Date(2016, 5, 1),
    data: 'Fake Data F'
  }]);
};

describe('Query Finders by Range', () => {
  before(() => {
    Rangeable = Dynamito.model('Rangeable', RangeableSchema);
  });
  beforeEach(() => {
    return Rangeable.scan().removeAll();
  });
  beforeEach(() => {
    return genValues();
  });
  after(() => {
    return Rangeable.scan().removeAll();
  });

  it('should query for potionName and find a list of ranges', () => {
    return Rangeable
      .query()
      .find(new Dynamito.Queries.Equal('name', 'Nigredo'))
      .exec().should.eventually.have.length(3);
  });

  it('should query for potionName and specific date', () => {
    return Rangeable
      .query()
      .find(new Dynamito.Queries.Equal('name', 'Nigredo'))
      .find(new Dynamito.Queries.Equal('date', new Date(2016, 4, 1)))
      .exec().should.eventually.have.length(1);
  });

  it('should query for potionName and find a part if a list of ranges', () => {
    return Rangeable
      .query()
      .find(new Dynamito.Queries.Equal('name', 'Nigredo'))
      .find(new Dynamito.Queries.GTEqual('date', new Date(2016, 4, 1)))
      .exec().should.eventually.have.length(2);
  });

  it('should query for potionName and greater date', () => {
    return Rangeable
      .query()
      .find(new Dynamito.Queries.Equal('name', 'Nigredo'))
      .find(new Dynamito.Queries.GT('date', new Date(2016, 4, 1)))
      .exec().should.eventually.have.length(1);
  });

  it('should query for potionName and lesser equal date', () => {
    return Rangeable
      .query()
      .find(new Dynamito.Queries.Equal('name', 'Nigredo'))
      .find(new Dynamito.Queries.LTEqual('date', new Date(2016, 4, 1)))
      .exec().should.eventually.have.length(2);
  });

  it('should query for potionName and lesser date', () => {
    return Rangeable
      .query()
      .find(new Dynamito.Queries.Equal('name', 'Nigredo'))
      .find(new Dynamito.Queries.LT('date', new Date(2016, 4, 1)))
      .exec().should.eventually.have.length(1);
  });

  it('should query for potionName and find a part if a list of ranges (between)', () => {
    return Rangeable
      .query()
      .find(new Dynamito.Queries.Equal('name', 'Nigredo'))
      .find(new Dynamito.Queries.Between('date', new Date(2016, 4, 1), new Date(2016, 4, 25)))
      .exec().should.eventually.have.length(1);
  });
});
