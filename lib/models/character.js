'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mark = require('./mark');

var _mark2 = _interopRequireDefault(_mark);

var _modelTypes = require('../constants/model-types');

var _modelTypes2 = _interopRequireDefault(_modelTypes);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS = {
  marks: new _immutable.Set(),
  text: ''
};

/**
 * Character.
 *
 * @type {Character}
 */

var Character = function (_ref) {
  _inherits(Character, _ref);

  function Character() {
    _classCallCheck(this, Character);

    return _possibleConstructorReturn(this, (Character.__proto__ || Object.getPrototypeOf(Character)).apply(this, arguments));
  }

  _createClass(Character, [{
    key: 'kind',


    /**
     * Get the kind.
     *
     * @return {String}
     */

    get: function get() {
      return 'character';
    }
  }], [{
    key: 'create',


    /**
     * Create a `Character` with `attrs`.
     *
     * @param {Object|Character} attrs
     * @return {Character}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Character.isCharacter(attrs)) return attrs;

      var character = new Character({
        text: attrs.text,
        marks: _mark2.default.createSet(attrs.marks)
      });

      return character;
    }

    /**
     * Create a list of `Characters` from `elements`.
     *
     * @param {Array<Object|Character>|List<Character>} elements
     * @return {List<Character>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (_immutable.List.isList(elements)) {
        return elements;
      }

      if (Array.isArray(elements)) {
        var list = new _immutable.List(elements.map(Character.create));
        return list;
      }

      throw new Error('Character.createList() must be passed an `Array` or a `List`. You passed: ' + elements);
    }

    /**
     * Create a characters list from a `string` and optional `marks`.
     *
     * @param {String} string
     * @param {Set<Mark>} marks (optional)
     * @return {List<Character>}
     */

  }, {
    key: 'createListFromText',
    value: function createListFromText(string, marks) {
      var chars = string.split('').map(function (text) {
        return { text: text, marks: marks };
      });
      var list = Character.createList(chars);
      return list;
    }

    /**
     * Check if a `value` is a `Character`.
     *
     * @param {Any} value
     * @return {Boolean}
     */

  }, {
    key: 'isCharacter',
    value: function isCharacter(value) {
      return !!(value && value[_modelTypes2.default.CHARACTER]);
    }
  }]);

  return Character;
}(new _immutable.Record(DEFAULTS));

/**
 * Attach a pseudo-symbol for type checking.
 */

Character.prototype[_modelTypes2.default.CHARACTER] = true;

/**
 * Export.
 *
 * @type {Character}
 */

exports.default = Character;