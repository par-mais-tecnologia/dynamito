import Dynamito from '../../lib/';

module.exports.BasicSchema = {
  id: {
    type: String,
    keyType: Dynamito.Schema.Types.HASH
  },
  name: String,
  age: Number
};

module.exports.BasicWrongSchemaWithoutTwoHashes = {
  name: {
    type: String,
    keyType: Dynamito.Schema.Types.HASH
  },
  sounds: {
    type: String,
    keyType: Dynamito.Schema.Types.HASH
  }
};

// ERRORs
module.exports.BasicWrongSchemaWithoutHash = {
  name: {
    type: String
  }
};

module.exports.BasicSchemaWithRange = {
  id: {
    type: String,
    keyType: Dynamito.Schema.Types.HASH
  },
  date: {
    type: Number,
    keyType: Dynamito.Schema.Types.RANGE
  }
};

module.exports.BasicSchemaWithMoreThanOneRange = {
  id: {
    type: String,
    keyType: Dynamito.Schema.Types.HASH
  },
  date: {
    type: Number,
    keyType: Dynamito.Schema.Types.RANGE
  },
  age: {
    type: Number,
    keyType: Dynamito.Schema.Types.RANGE
  }
};
