/**
 * Dynamo model, with all user operations.
 */

const availableEvents = [
  'save',
  'remove',
];

/**
 * Check if specific topi exists.
 */
const isEvent = eventName => availableEvents.indexOf(eventName) !== -1;

/**
 * Event Listner Object, with 'on' and 'emit' events.
 */
class Listner {
  constructor() {
    this.topics = {};
  }

  /**
   * Register a callbak on a specific topic.
   */
  on(modelName, eventName, listener) {
    if (!isEvent(eventName)) {
      throw new Error(`Undefined event: ${eventName}`);
    }

    const evName = `${modelName}:${eventName}`;
    if (this.topics[evName] === undefined) {
      this.topics[evName] = [];
    }
    this.topics[evName].push(listener);
  }

  /**
   * Emit an event on a specific topic.
   */
  emit(modelName, eventName, data) {
    if (!isEvent(eventName)) {
      throw new Error(`Undefined event: ${eventName}`);
    }

    const evName = `${modelName}:${eventName}`;
    if (this.topics[evName] === undefined) {
      return;
    }

    this.topics[evName].forEach(callback => callback(data));
  }
}

export default Listner;
