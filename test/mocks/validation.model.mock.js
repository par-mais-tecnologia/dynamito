import Dynamito from '../../lib/';

const ValidationSchema = new Dynamito.Schema({
  id: {
    type: String,
    keyType: Dynamito.Schema.Types.HASH
  },
  value: String,
  preValidated: String,
  posValidated: String,
});

ValidationSchema
  .path('preValidated')
  .validate(preValidated => {
    return preValidated !== undefined;
  }, 'Pré validation did not run!');

ValidationSchema
  .path('posValidated')
  .validate(posValidated => {
    return posValidated === undefined;
  }, 'Pos validation runned!');

ValidationSchema
  .pre('validate', function (next) {
    this.preValidated = this.value;
    next();
  });

ValidationSchema
  .post('validate', function (next) {
    this.posValidated = this.value;
    next();
  });

module.exports = ValidationSchema;
