import Dynamito from '../../lib/';

var GenderSchema = new Dynamito.Schema({
  id: {
    type: String,
    keyType: Dynamito.Schema.Types.HASH
  },
  gender: {
    type: String,
    enum: ['Male', 'Female']
  }
});

module.exports = GenderSchema;
