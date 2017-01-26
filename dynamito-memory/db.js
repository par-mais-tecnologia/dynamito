/**
 * Match a finder to an item.
 *
 * Finder is an Object with one ot more key value.
 * This test will try to match all finder key to an item, and if this key is present, will check its values.
 * Return will be true if all keys ar matched.
 *
 * @param item
 * @param finder
 * @returns {boolean}
 */
function match(item, finder) {
  var keys = Object.keys(finder);
  var times = 0;
  for (var itk in finder) {
    if (finder.hasOwnProperty(itk)) {
      if (keys.indexOf(itk) >= 0) {
        if (finder[itk] === item[itk]) {
          times++;
        }
      }
    }
  }
  return times === keys.length;
}

function toFinder(tableDef, value) {
  var keyObj = {};
  tableDef.forEach(it => {
    keyObj[it.AttributeName] = value[it.AttributeName];
  });
  return keyObj;
}

export default function Database() {
  this.db = {};
}

Database.prototype.getTablesNames = function () {
  return Object.keys(this.db);
};

Database.prototype.createTable = function (tableName, meta) {
  this.db[tableName] = {
    meta: meta,
    data: []
  };
};

Database.prototype.deleteTable = function (tableName) {
  delete this.db[tableName];
};

Database.prototype.hasTable = function (table) {
  return this.db[table] !== undefined;
};

Database.prototype.put = function (table, value) {
  var found = -1;
  var dataSet = this.db[table].data;
  var tableFInder = toFinder(this.db[table].meta.KeySchema, value);
  for (var i = 0; i < dataSet.length; i++) {
    if (match(dataSet[i], tableFInder)) {
      found = i;
    }
  }

  if (found === -1) {
    this.db[table].data.push(value);
  } else {
    this.db[table].data[found] = value;
  }
};

Database.prototype.get = function (table, keyObject) {
  var dataSet = this.db[table].data;
  for (var i = 0; i < dataSet.length; i++) {
    if (match(dataSet[i], keyObject)) {
      return dataSet[i];
    }
  }
  return null;
};

Database.prototype.query = function (table, searchObject) {
  if (this.db[table] === undefined) {
    return [];
  }
  var dataSet = this.db[table].data;
  var result = [];

  dataSet.forEach(it => {
    var matches = 0;
    searchObject.forEach(filter => {
      if (filter.opr(it[filter.name])) {
        matches++;
      }
    });

    if (matches === searchObject.length) {
      result.push(it);
    }
  });

  return result;
};

Database.prototype.getAll = function (table) {
  return this.db[table].data;
};

Database.prototype.delete = function (table, keyObject) {
  var dataSet = this.db[table].data;
  for (var i = 0; i < dataSet.length; i++) {
    if (match(dataSet[i], keyObject)) {
      dataSet.splice(i, 1);
    }
  }
};
