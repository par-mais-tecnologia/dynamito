import waterfall from 'async/waterfall';

import Dynamito from '../lib';
import PersonSchema from './mocks/person.model.mock.js';

var PersonModel;

describe('Dynamito Custom Methods: ', () => {
  beforeEach(done => {
    PersonModel = Dynamito.model('Person', PersonSchema);
    PersonModel.scan().removeAll().then(done);
  });

  describe('Method features', () => {
    it('should access configured method that use own attributes', done => {
      var input = [{
        email: 'some.email@target.com',
        name: 'Derty',
        last: 'Lancotre',
        age: 42,
        ocupation: 'President'
      }, {
        email: 'some.other@target.com',
        name: 'Jonn',
        last: 'Snow',
        age: 42,
        ocupation: 'Night Watch'
      }];

      waterfall([next => {
        PersonModel
          .create(input)
          .then(() => {
            next();
          })
          .catch(done);
      }, next => {
        PersonModel
          .findById(input[1].email)
          .exec()
          .then(result => {
            next(null, result);
          }).catch(done);
      }], (err, result) => {
        expect(result.computeTask()).to.be.equal(result.getchant());
        done(err);
      });
    });

    it('should access configured method that use own attributes with parameters', done => {
      var input = [{
        email: 'some.email@target.com',
        name: 'Derty',
        last: 'Lancotre',
        age: 42,
        ocupation: 'President'
      }, {
        email: 'some.other@target.com',
        name: 'Jonn',
        last: 'Snow',
        age: 42,
        ocupation: 'Night Watch'
      }];

      waterfall([next => {
        PersonModel
          .create(input)
          .then(() => {
            next();
          })
          .catch(done);
      }, next => {
        PersonModel
          .findById(input[0].email)
          .exec()
          .then(result => {
            next(null, result);
          }).catch(done);
      }], (err, result) => {
        expect(result.computeTask('Brasil')).to.be.equal('Fly Away');
        done(err);
      });
    });
  });
});
