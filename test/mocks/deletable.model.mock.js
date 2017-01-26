import Dynamito from '../../lib/';

var DeletableSchama = new Dynamito.Schema({
  id: {
    type: String,
    keyType: Dynamito.Schema.Types.HASH
  },
  name: {
    type: String
  },
  active: {
    type: Boolean
  }
});

module.exports = DeletableSchama;
