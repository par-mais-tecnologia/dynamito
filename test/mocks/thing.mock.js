import Dynamito from '../../lib/';
var Schema = Dynamito.Schema;

var ThingSchema = new Schema({
  name: {
    type: String,
    keyType: Dynamito.Schema.Types.HASH
  },
  info: {
    type: String
  },
  extra: String,
  active: {
    type: Boolean,
    default: false
  },
  date: Date
});

module.exports = ThingSchema;
