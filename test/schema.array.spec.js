// Async Library
import ascyn from 'async';

// Creating a model to this tests.
import Dynamito from '../lib';
var Schema = Dynamito.Schema;

var AccessModel;

function setup(table, s) {
  return done => {
    var ListSchema = new Schema(s);
    AccessModel = Dynamito.model(table, ListSchema);
    done();
  };
}

function clean() {
  return done => {
    AccessModel.scan().removeAll().then(done);
  };
}

describe('Dynamito Array Support', () => {
  describe('Dynamito array support', () => {
    before(setup('List', {
      id: {
        type: String,
        keyType: Dynamito.Schema.Types.HASH
      },
      tags: [String],
      dates: [Date]
    }));
    beforeEach(clean());
    after(() => {
      return AccessModel.deleteTable();
    });

    it('should accept a model with array notation', () => {
      expect(AccessModel).not.to.be.equal(undefined);
    });

    it('should accept data of a given type (String)', done => {
      ascyn.waterfall([
        next => {
          AccessModel
            .create({
              id: '0001',
              tags: ['sky', 'earth', 'green']
            })
            .then(() => {
              next(null);
            })
            .catch(done);
        },
        next => {
          AccessModel
            .findById('0001')
            .exec()
            .then(data => {
              expect(data.tags.indexOf('sky')).not.to.be.equal(-1);
              expect(data.tags.indexOf('earth')).not.to.be.equal(-1);
              expect(data.tags.indexOf('green')).not.to.be.equal(-1);
              next();
            })
            .catch(done);
        }
      ], err => {
        done(err);
      });
    });

    it('should accept data of a given type (Date)', done => {
      ascyn.waterfall([
        next => {
          AccessModel
            .create({
              id: '0001',
              dates: [new Date(2006, 10, 10), new Date(2007, 5, 5)]
            }).then(() => {
              next();
            }).catch(next);
        },
        next => {
          AccessModel
            .findById('0001')
            .exec()
            .then(data => {
              expect(data.dates[0]).not.to.be.equal(new Date(2006, 10, 10));
              expect(data.dates[1]).not.to.be.equal(new Date(2007, 5, 5));
              next();
            })
            .catch(next);
        }
      ], done);
    });
  });

  describe('Dynamito arrays: object', () => {
    before(setup('List', {
      id: {
        type: String,
        keyType: Dynamito.Schema.Types.HASH
      },
      tables: {
        type: [Object]
      }
    }));
    beforeEach(clean());
    after(() => {
      return AccessModel.deleteTable();
    });

    it('sholud validate required array to not be undefined', done => {
      var n = new AccessModel({
        id: '0002',
        tables: [{
          name: 'T'
        }, {
          name: 'P'
        }]
      });
      return n
        .save()
        .then(res => {
          expect(res.tables).to.deep.equal([{
            name: 'T'
          }, {
            name: 'P'
          }]);
          done();
        })
        .catch(done);
    });
  });

  describe('Dynamito arrays: advanced', () => {
    before(setup('List', {
      id: {
        type: String,
        keyType: Dynamito.Schema.Types.HASH
      },
      tags: {
        type: [String],
        required: true
      }
    }));
    beforeEach(clean());
    after(() => {
      return AccessModel.deleteTable();
    });

    it('should accept a model with nested configuration of array and required field', () => {
      expect(AccessModel).not.to.be.equal(undefined);
    });

    it('sholud validate required array to not be undefined 2', () => {
      var n = new AccessModel({
        id: '0002'
      });
      return n.save().should.be.rejectedWith('Required field: tags');
    });

    it('sholud not be even empty when required', () => {
      var n = new AccessModel({
        id: '0002',
        tags: []
      });
      return n.save().should.be.rejectedWith('Required array cannot be empty: tags');
    });
  });

  describe('Dynamito arrays: enum', () => {
    before(setup('List', {
      id: {
        type: String,
        keyType: Dynamito.Schema.Types.HASH
      },
      tags: {
        type: [String],
        enum: ['AAA', 'BBB', 'CCC'],
        required: true
      }
    }));
    beforeEach(clean());
    after(() => {
      return AccessModel.deleteTable();
    });

    it('sholud array to have only enum values', () => {
      var n = new AccessModel({
        id: '0007',
        tags: ['AAA']
      });
      return n.save().should.not.be.rejected;
    });

    it('sholud reject not accept valous outside of enum', () => {
      var n = new AccessModel({
        id: '0017',
        tags: ['DDD']
      });
      return n.save().should.be.rejectedWith('Selected values not in list: AAA,BBB,CCC');
    });
  });
});
