'use strict';

var async = require('async');

function Hooks() {
  if (!(this instanceof Hooks)) {
    return new Hooks();
  }
  this._pre = {
    save: []
  };
  this._post = {
    save: []
  };
}

Hooks.prototype.hooks = ['pre', 'post'];
Hooks.prototype.conditions = ['save'];

/**
 * Register a pre condition hook.
 */
Hooks.prototype.pre = function (condition, callback) {
  if (this.conditions.indexOf(condition) === -1) {
    throw new Error('Invalid Condition:' + condition);
  }
  this._pre[condition].push(callback);
};

/**
 * Register a post condition.
 */
Hooks.prototype.post = function (condition, callback) {
  if (this.conditions.indexOf(condition) === -1) {
    throw new Error('Invalid Condition:' + condition);
  }
  this._post[condition].push(callback);
};

Hooks.prototype.execHook = function (hook, condition, inputInst, callback) {
  if (this.hooks.indexOf(hook) === -1) {
    callback(new Error('Invalid Hook:' + hook));
  }
  if (this.conditions.indexOf(condition) === -1) {
    callback(new Error('Invalid Condition:' + condition));
  }

  async.eachSeries(this['_' + hook][condition], function (fn, next) {
    return fn.call(inputInst, next);
  }, function (err, data) {
    callback(err, data);
  });
};

module.exports = Hooks;