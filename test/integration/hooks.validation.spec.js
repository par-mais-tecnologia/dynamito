import Dynamito from '../../lib';
import ValidationSchema from '../mocks/validation.model.mock.js';

var ValidationModel;

function change(input) {
  return input + '56789';
}

let data;
let sample;
function genSample() {
  data = {
    id: 'idA',
    value: 'some-value',
  };
  sample = new ValidationModel(Object.assign({}, data));
  return sample;
}

describe('Dynamito Hooks: #validation: ', () => {
  before(() => {
    ValidationModel = Dynamito.model('Person', ValidationSchema);
    return ValidationModel.scan().removeAll();
  });
  beforeEach(() => {
    genSample();
  });
  after(() => {
    return ValidationModel.scan().removeAll();
  });

  describe('Pré', () => {
    it('should save on pre validation stage', () => {
      return sample
        .save()
        .then(() => {
          return ValidationModel
            .findById(data.id)
            .exec()
            .then((data) => {
              expect(data.preValidated).to.be.equal('some-value');
              return data;
            });
        })
        .should.not.be.rejected;
    });
    it('should create on pre validation stage', () => {
      return ValidationModel
        .create(Object.assign({}, data))
        .then(() => {
          return ValidationModel
            .findById(data.id)
            .exec()
            .then((data) => {
              expect(data.preValidated).to.be.equal('some-value');
              return data;
            });
        })
        .should.not.be.rejected;
    });
  });

  describe('Post', () => {
    it('should save on post validation stage', () => {
      return sample
        .save()
        .then((data) => {
          expect(data.posValidated).to.be.equal('some-value');
          return data;
        })
        .then(() => {
          return ValidationModel
            .findById(data.id)
            .exec()
            .then((data) => {
              expect(data.posValidated).to.be.equal('some-value');
              return data;
            });
        })
        .should.not.be.rejected;
    });

    it('should create on post validation stage', () => {
      return ValidationModel
        .create(Object.assign({}, data))
        .then((data) => {
          expect(data.posValidated).to.be.equal('some-value');
          return data;
        })
        .then(() => {
          return ValidationModel
            .findById(data.id)
            .exec()
            .then((data) => {
              expect(data.posValidated).to.be.equal('some-value');
              return data;
            });
        })
        .should.not.be.rejected;
    });
  });
});
