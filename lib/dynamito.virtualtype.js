/**
 * VirtualType constructor
 *
 * Used to crete virtual attributes.
 *
 * @link https://github.com/Automattic/mongoose/blob/master/lib/virtualtype.js
 *
 */

class VirtualType {
  constructor(name) {
    this.path = name;
    this.getters = [];
    this.setters = [];
  }

  /**
   * Defines a getter.
   *
   * ####Example:
   *
   *     var virtual = schema.virtual('fullname');
   *     virtual.get(function () {
   *       return this.name.first + ' ' + this.name.last;
   *     });
   *
   * @param {Function} fn
   * @return {VirtualType} this
   */
  get(fn) {
    this.getters.push(fn);
    return this;
  }

  /**
   * Defines a setter.
   *
   * ####Example:
   *
   *     var virtual = schema.virtual('fullname');
   *     virtual.set(function (v) {
   *       var parts = v.split(' ');
   *       this.name.first = parts[0];
   *       this.name.last = parts[1];
   *     });
   *
   * @param {Function} fn
   * @return {VirtualType} this
   */
  set(fn) {
    this.setters.push(fn);
    return this;
  }

  /**
   * Applies getters to `value` using optional `scope`.
   *
   * @param {Object} value
   * @param {Object} scope
   * @return {any} the value after applying all getters
   */
  applyGetters(value, scope) {
    let v = value;
    for (let l = this.getters.length - 1; l >= 0; l -= 1) {
      v = this.getters[l].call(scope, v, this);
    }
    return v;
  }

  /**
   * Applies setters to `value` using optional `scope`.
   *
   * @param {Object} value
   * @param {Object} scope
   * @return {any} the value after applying all setters
   */
  applySetters(value, scope) {
    let v = value;
    for (let l = this.setters.length - 1; l >= 0; l -= 1) {
      v = this.setters[l].call(scope, v, this);
    }
    return v;
  }
}

export default VirtualType;

