import Dynamito from '../../lib/';

var PersonSchema = new Dynamito.Schema({
  email: {
    type: String,
    keyType: Dynamito.Schema.Types.HASH
  },
  name: {
    type: String
  },
  last: String,
  password: String,
  age: {
    type: Number,
    required: true
  },
  ocupation: String
});

// Virtual Full Name
PersonSchema
  .path('name')
  .validate(name => {
    return name.length >= 4;
  }, 'Name cannot be lesser than 4 character');

PersonSchema
  .path('last')
  .validate((last, respond) => {
    return new Promise(resolve => {
      var test = last.length <= 10;
      resolve(test);
    })
    .then(res => {
      respond(res);
    })
    .catch(() => {
      throw new Error('Unknown error');
    });
  }, 'Last Name cannot be larger than 10 character');

PersonSchema
  .pre('save', function (next) {
    this.changePass();
    next();
  });

PersonSchema
  .post('save', function (next) {
    this.punctuation();
    next();
  });

// Virtual Full Name
PersonSchema
  .virtual('full')
  .get(function () {
    return this.name + ' ' + this.last;
  });

PersonSchema.methods = {
  getchant() {
    return 'Night gathers, and now my watch begins. It shall not end until my death. I shall take no wife, hold no lands, father no children. I shall wear no crowns and win no glory. I shall live and die at my post. I am the sword in the darkness. I am the watcher on the walls. I am the fire that burns against the cold, the light that brings the dawn, the horn that wakes the sleepers, the shield that guards the realms of men. I pledge my life and honor to the Night\'s Watch, for this night and all the nights to come.';
  },
  presidentByCountry(country) {
    if (country === 'Brasil') {
      return 'Fly Away';
    }
    return 'Do President Stuffs.';
  },
  computeTask(country) {
    if (this.ocupation === 'Night Watch') {
      return this.getchant();
    } else if (this.ocupation === 'President') {
      return this.presidentByCountry(country);
    }
  },
  changePass() {
    function change(input) {
      return input + '56789';
    }
    this.password = change(this.password);
  },
  punctuation() {
    this.last += '!';
  }
};

module.exports = PersonSchema;
