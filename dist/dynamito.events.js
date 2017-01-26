/**
 * Dynamo model, with all user operations.
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var availableEvents = ['save', 'remove'];

/**
 * Check if specific topi exists.
 */
function isEvent(eventName) {
  return availableEvents.indexOf(eventName) !== -1;
}

/**
 * Event Listner Object, with 'on' and 'emit' events.
 */
function Listner() {
  this.topics = {};
}

/**
 * Register a callbak on a specific topic.
 */
Listner.prototype.on = function (modelName, eventName, listener) {
  if (!isEvent(eventName)) {
    throw new Error('Undefined event: ' + eventName);
  }

  var evName = modelName + ':' + eventName;
  if (this.topics[evName] === undefined) {
    this.topics[evName] = [];
  }
  this.topics[evName].push(listener);
};

/**
 * Emit an event on a specific topic.
 */
Listner.prototype.emit = function (modelName, eventName, data) {
  if (!isEvent(eventName)) {
    throw new Error('Undefined event: ' + eventName);
  }

  var evName = modelName + ':' + eventName;
  if (this.topics[evName] === undefined) {
    return;
  }

  this.topics[evName].forEach(function (callback) {
    callback(data);
  });
};

exports.default = Listner;