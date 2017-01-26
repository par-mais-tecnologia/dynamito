import Dynamito from '../../lib/';
var Schema = Dynamito.Schema;

var AllValuesSchema = new Schema({
  id: {
    type: String,
    keyType: Dynamito.Schema.Types.HASH
  },
  name: String,
  age: Number,
  structure: Object,
  birthDate: Date,
  active: Boolean
});

module.exports = AllValuesSchema;
