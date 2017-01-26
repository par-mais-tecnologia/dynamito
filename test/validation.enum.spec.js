import Dynamito from '../lib';

import GenderSchema from './mocks/gender.model.mock.js';
var GenderModel;

describe('Dynamito Enums Validation: ', () => {
  beforeEach(() => {
    GenderModel = Dynamito.model('Gender', GenderSchema);
    GenderModel.scan().removeAll();
  });

  it('should save when element is on the list', () => {
    var bm = new GenderModel({
      id: '0001',
      gender: 'Male'
    });
    return bm.save().should.not.be.rejected;
  });

  it('should not save when element is on the list', () => {
    var bm = new GenderModel({
      id: '0001',
      gender: 'SomeValue'
    });
    return bm.save().should.be.rejectedWith('Value not in list: Male,Female');
  });
});
