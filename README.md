# Dynamito

Easily binding your Node application to AWS DynamoDb.

## Motivation

You may ask: 'Why another DynamoDb Connector?'

The proposal of this tool is to replace Mongoose from applications that use it, when you want to change from MongoDb to DynamoDb. Basically, this one has been developed to replace Mongoose on Yeoman Angular-Fullstack Generator, with all basic features used on that generator.

Reference: [Mongodb](https://github.com/Automattic/mongoose)

### Future of this Library

There are many features that is not developed yet and can be developed to increate this library power, like new hooks and operations. The main gloal is that the methods and classes my be like Mongoose methods and classes.

This library will be perfect when you change your importation from your project from Mongoose to Dynamito and it still working.

`Hell YeaH!`

Ok, different technologies and not everything will be equal, but we will do our best.

### Guidelines

This library act on this principles:

1. Mongoose like library.
2. Well tested.

### TODO's

1. Test Db Operations.

## Installation

`TODO`

## Overview

### Connect to DynamoDb

This guideline will help you to configure your NodeJs application to connect to DynamoDb. It will connect to your local when developing and to Amazon when in production.

`TODO`

### Defining a Model

`TODO`

#### Key Types

On DynamoDb, every table must have a Partition Key (HASH). So, you need to specify on your model this key. Like:

```
var BasicSchema = {
  id: {
    type: String,
    keyType: Dynamito.Schema.Types.HASH
  },
  name: String,
  age: Number
};
```

On this case, `keyType: 'HASH'` is used to specify that key as partition key of your table.

DynamoDb accpets the creation of a Sort Key (RANGE). To configure a schema with it, use:

```
var BasicSchemaWithRange = {
  id: {
    type: String,
    keyType: Dynamito.Schema.Types.HASH
  },
  date: {
    type: String,
    keyType: Dynamito.Schema.Types.RANGE
  }
};
```

On this case, `keyType: 'RANGE'` is used to specify that key as sort key of your table.

#### Valid Types

Valid types are:

1. String
2. Boolean
3. Number
4. Date
5. Object
6. Array, as [] around a type (Eg. [String] is an Array of Strings).

#### Special Types

1. AUTO: Will auto generate IDs on new entities, on String format.

> As DynamoDb do not support Native Auto Ids, by using this strategy will take and additional get to chekc if that ID is already used. The colition chance is realy small, but on colision, a new ID will be generated and a a new query will be done to check this new ID.
> Based on DynamoDb structure, is not recommended to use this strategy, but sometimes, you maybe need an Auto Id. 

#### Fields options

##### Lowercase fields

To create a field that is always saved in lowercase, do:

```
var BasicSchema = {
  id: {
    type: String,
    keyType: Dynamito.Schema.Types.HASH
  },
  name: {
    type: Number,
    lowercase: true
  }
};
```

On this case, `name` data will be saved always as lowercase. 

##### Default value fields

To create default values to fields, do:

```
var BasicSchema = {
  id: {
    type: String,
    keyType: Dynamito.Schema.Types.HASH
  },
  name: {
    type: Number,
    default: 'Jon Snow'
  }
};
```

On this case, `name` will, by default, if left empty, be `Jon Snow`.

### Accessing a Model

`TODO`

### Scan tables for data

`TODO`

#### Filterin Scan operations

#### Specifying attributes on Queries

To remove fields from queries, you can use `fields()` operation from a Finder, just like:

```
User
    .scan()
    .fields(['-password'])
    .exec()
```

On this case, password field will be removed from response on all queries.

### Query for data

Queries on DyanamoDB are filters applied only over Partition Ken and Sort Key. This operations use to be faster and more efficient than a Scan operation. 

You can either configure your Dynamo Table and create indexes, to let things faster when searching for some extra atributes.

#### Finders

Finder are operations used to search for data directly bu its Hash Key or Sort Key.

```
SampleModel
  .findById('Some ID')
  .exec()
  .then(response => {
    console.log(response);
  });
```

On case above, we are looking for a single dara with, where its Primary Key is `Some ID`. If your model has only a Hash Key, `response` will contain a single object. If your model has a Range Key, `response` will contain a list of elements.

If you want to search a single data, bu its Hash and Range Key, you can use `findById` as:

```
SampleModel
  .findById('Some ID', 'Some Range Id')
  .exec()
  .then(response => {
    console.log(response);
  });
```

#### Queries

Queries are used to search for data with more complex "Queries"

```
SampleModel
  .query()
  .find(new Dynamito.Queries.Equal('id', 'Some ID'))
  .exec()
  .then(response => {
    console.log(response);
  });
```

On example above, we are doing exactly like on 'findById'.
 
You can add more queries in a single search. Each one of them will be added with AND operator, like this:
 
```
SampleModel
  .query()
  .find(new Dynamito.Queries.Equal('id', 'Some ID'))
  .find(new Dynamito.Queries.GT('date', new Date(2016,0,15)))
  .exec()
  .then(response => {
    console.log(response);
  });
```

Supposing that SampleModel has HASH(id) and RANGE(name), this case will `response` will return a list of elements that mach: id = "Some ID" AND date > 2016-Jan-15.

**Important**: This version od Dynamito only support querying by Partition Keys ans Sort Keys. Future version you will be able add filter over a query (To filter not primary keys, from now you have to use Scan to do this).

### Virtual Attributes

It is possible to create virtual attributes, that area a composition of other attributes. On this case, this data will not be saved on database with this information, they will only be shown when is instanciated.

Example from Angualr-Fullstack Generator
```
var PersonSchema = new Dynamito.Schema({
  email: {
    type: String,
    keyType: Dynamito.Schema.Types.HASH
  },
  name: String,
  last: String
});

// Virtual Full Name
PersonSchema
  .virtual('full')
  .get(function() {
    return this.name + ' ' + this.last;
  });
  
 ver Person = {
    name: 'Jon',
    last: 'Snow'
 }
```

On this case, when `person.full` is accessed, `Jon Snow`will be returned.

### Query Population

TODO


# TODOS

1. Remvoe winston from core library.