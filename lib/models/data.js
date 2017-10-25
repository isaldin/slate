'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require('immutable');

/**
 * Data.
 *
 * This isn't an immutable record, it's just a thin wrapper around `Map` so that
 * we can allow for more convenient creation.
 *
 * @type {Object}
 */

var Data = {

  /**
   * Create a new `Data` with `attrs`.
   *
   * @param {Object} attrs
   * @return {Data} data
   */

  create: function create() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return _immutable.Map.isMap(attrs) ? attrs : new _immutable.Map(attrs);
  }
};

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Data;