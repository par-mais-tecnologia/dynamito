import Dynamito from '../../lib/';

const NestedSchema = new Dynamito.Schema({
  id: {
    type: Dynamito.Schema.Types.ObjectId,
    keyType: Dynamito.Schema.Types.HASH
  },
  name: String,
  value: String
});

export {
  NestedSchema as default
};
