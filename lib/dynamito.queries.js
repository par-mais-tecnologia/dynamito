/**
 * Dynamo Queries to Queries and Filters to be used on scans.
 */

class Query {
  static SCAN = 'scan';
  static QUERY = 'query';

  constructor(key, value, operator, extra) {
    this.key = key;
    this.value = value;
    this.operator = operator;
    this.extra = extra;

    this.mode = undefined;
  }

  setMode(mode) {
    this.mode = mode;
  }

  getModeKey() {
    if (this.mode === Query.SCAN) {
      return 'FilterExpression';
    } else if (this.mode === Query.QUERY) {
      return 'KeyConditionExpression';
    }
    return '';
  }

  buildExpression(index, schema, element) {
    const path = schema.path(this.key);
    const modeKey = this.getModeKey();

    element[modeKey] += `#name${index} ${this.operator} :value${index}`;

    element.ExpressionAttributeNames[`#name${index}`] = this.key;

    element.ExpressionAttributeValues[`:value${index}`] = path.meta.stringfy(this.value);
  }

  fill(index, schema, element) {
    const modeKey = this.getModeKey();
    element[modeKey] = element[modeKey] || '';
    element.ExpressionAttributeValues = element.ExpressionAttributeValues || {};
    element.ExpressionAttributeNames = element.ExpressionAttributeNames || {};

    if (element[modeKey] !== '') {
      element[modeKey] += ' AND ';
    }

    this.buildExpression(index, schema, element);
  }
}


/**
 * Query to fetch equals.
 * @param key
 * @param value
 * @constructor
 */
class Equal extends Query {
  constructor(key, value) {
    super(key, value, '=');
  }
}

/**
 * Query to fetch lesser then.
 * @param key
 * @param value
 * @constructor
 */
class LT extends Query {
  constructor(key, value) {
    super(key, value, '<');
  }
}

/**
 * Query to fetch lesser then or equal
 * @param key
 * @param value
 * @constructor
 */
class LTEqual extends Query {
  constructor(key, value) {
    super(key, value, '<=');
  }
}

/**
 * Query to fetch greater then.
 * @param key
 * @param value
 * @constructor
 */
class GT extends Query {
  constructor(key, value) {
    super(key, value, '>');
  }
}

/**
 * Query to fetch greater then or equal.
 * @param key
 * @param value
 * @constructor
 */
class GTEqual extends Query {
  constructor(key, value) {
    super(key, value, '>=');
  }
}

/**
 * Query to fetch intervals.
 * @param key
 * @param valueA Start value.
 * * @param valueB Ed value.
 * @constructor
 */
class Between extends Query {
  constructor(key, value, valueB) {
    super(key, value, 'BETWEEN', valueB);
  }

  buildExpression(index, schema, element) {
    const path = schema.path(this.key);
    const modeKey = this.getModeKey();

    element.ExpressionAttributeNames[`#name${index}`] = this.key;

    element[modeKey] += `#name${index} ${this.operator} :value${index}`;
    element.ExpressionAttributeValues[`:value${index}`] = path.meta.stringfy(this.value);

    element[modeKey] += ` AND :value${index}_extra`;
    element.ExpressionAttributeValues[`:value${index}_extra`] = path.meta.stringfy(this.extra);
  }
}

export {
  Query,
  Equal,
  LT,
  LTEqual,
  GT,
  GTEqual,
  Between,
};
