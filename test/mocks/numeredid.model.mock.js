import Dynamito from '../../lib/';
var Schema = Dynamito.Schema;

var NumeredId = new Schema({
  id: {
    type: Number,
    keyType: Dynamito.Schema.Types.HASH
  },
  description: String,
  index: Number,
  active: Boolean
});

module.exports = NumeredId;
