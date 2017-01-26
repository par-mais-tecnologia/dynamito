import Dynamito from '../../lib/';
var Schema = Dynamito.Schema;

export const storySchema = new Schema({
  creator: {
    type: String,
    ref: 'Person'
  },
  title: {
    type: String,
    keyType: Schema.Types.HASH
  },
  fans: {
    type: [String],
    ref: 'Person'
  }
});

export const authorSchema = new Schema({
  id: {
    type: Schema.Types.ObjectId,
    keyType: Schema.Types.HASH
  },
  name: String,
  age: Number
});
