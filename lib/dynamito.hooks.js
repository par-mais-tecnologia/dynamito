import async from 'async';

function Hooks() {
  if (!(this instanceof Hooks)) {
    return new Hooks();
  }
  this.preEvent = {
    save: [],
    validate: [],
  };
  this.postEvent = {
    save: [],
    validate: [],
  };
}

Hooks.prototype.hooks = ['pre', 'post'];
Hooks.prototype.conditions = ['save', 'validate'];

/**
 * Register a pre condition hook.
 */
Hooks.prototype.pre = function (condition, callback) {
  if (this.conditions.indexOf(condition) === -1) {
    throw new Error(`Invalid Condition:${condition}`);
  }
  this.preEvent[condition].push(callback);
};

/**
 * Register a post condition.
 */
Hooks.prototype.post = function (condition, callback) {
  if (this.conditions.indexOf(condition) === -1) {
    throw new Error(`Invalid Condition:${condition}`);
  }
  this.postEvent[condition].push(callback);
};

Hooks.prototype.execHook = function (hook, condition, inputInst, callback) {
  if (this.hooks.indexOf(hook) === -1) {
    callback(new Error(`Invalid Hook:${hook}`));
  }
  if (this.conditions.indexOf(condition) === -1) {
    callback(new Error(`Invalid Condition:${condition}`));
  }

  async.eachSeries(this[`${hook}Event`][condition], (fn, next) =>
    fn.call(inputInst, next), (err, data) =>
      callback(err, data));
};

module.exports = Hooks;
