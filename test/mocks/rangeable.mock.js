import Dynamito from '../../lib/';
var Schema = Dynamito.Schema;

var RangeableSchema = new Schema({
  name: {
    type: String,
    keyType: Dynamito.Schema.Types.HASH
  },
  date: {
    type: Date,
    keyType: Dynamito.Schema.Types.RANGE
  },
  data: {
    type: String
  }
});

module.exports = RangeableSchema;
