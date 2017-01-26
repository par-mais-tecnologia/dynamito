import Dynamito from '../../lib/';
var Schema = Dynamito.Schema;

var AutoId = new Schema({
  id: {
    type: Dynamito.Schema.Types.ObjectId,
    keyType: Dynamito.Schema.Types.HASH
  },
  mate: {
    type: Dynamito.Schema.Types.ObjectId,
    keyType: Dynamito.Schema.Types.RANGE
  },
  name: String,
  age: Number
});

module.exports = AutoId;
