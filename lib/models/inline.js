'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('./document');

var _block = require('./block');

var _block2 = _interopRequireDefault(_block);

var _data = require('./data');

var _data2 = _interopRequireDefault(_data);

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

var _text = require('./text');

var _text2 = _interopRequireDefault(_text);

var _modelTypes = require('../constants/model-types');

var _modelTypes2 = _interopRequireDefault(_modelTypes);

var _generateKey = require('../utils/generate-key');

var _generateKey2 = _interopRequireDefault(_generateKey);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
/**
 * Prevent circular dependencies.
 */

/**
 * Dependencies.
 */

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS = {
  data: new _immutable.Map(),
  isVoid: false,
  key: null,
  nodes: new _immutable.List(),
  type: null
};

/**
 * Inline.
 *
 * @type {Inline}
 */

var Inline = function (_ref) {
  _inherits(Inline, _ref);

  function Inline() {
    _classCallCheck(this, Inline);

    return _possibleConstructorReturn(this, (Inline.__proto__ || Object.getPrototypeOf(Inline)).apply(this, arguments));
  }

  _createClass(Inline, [{
    key: 'kind',


    /**
     * Get the node's kind.
     *
     * @return {String}
     */

    get: function get() {
      return 'inline';
    }

    /**
     * Is the node empty?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isEmpty',
    get: function get() {
      return this.text == '';
    }

    /**
     * Get the concatenated text `string` of all child nodes.
     *
     * @return {String}
     */

  }, {
    key: 'text',
    get: function get() {
      return this.getText();
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Inline` with `attrs`.
     *
     * @param {Object|Inline} attrs
     * @return {Inline}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (_block2.default.isBlock(attrs)) return attrs;
      if (Inline.isInline(attrs)) return attrs;
      if (_text2.default.isText(attrs)) return attrs;

      if (!attrs.type) {
        throw new Error('You must pass an inline `type`.');
      }

      var nodes = attrs.nodes;

      var empty = !nodes || nodes.size == 0 || nodes.length == 0;
      var inline = new Inline({
        type: attrs.type,
        key: attrs.key || (0, _generateKey2.default)(),
        data: _data2.default.create(attrs.data),
        isVoid: !!attrs.isVoid,
        nodes: _node2.default.createList(empty ? [_text2.default.create()] : nodes)
      });

      return inline;
    }

    /**
     * Create a list of `Inlines` from an array.
     *
     * @param {Array<Object|Inline>} elements
     * @return {List<Inline>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (_immutable.List.isList(elements)) return elements;
      return new _immutable.List(elements.map(Inline.create));
    }

    /**
     * Check if a `value` is a `Inline`.
     *
     * @param {Any} value
     * @return {Boolean}
     */

  }, {
    key: 'isInline',
    value: function isInline(value) {
      return !!(value && value[_modelTypes2.default.INLINE]);
    }
  }]);

  return Inline;
}(new _immutable.Record(DEFAULTS));

/**
 * Attach a pseudo-symbol for type checking.
 */

Inline.prototype[_modelTypes2.default.INLINE] = true;

/**
 * Mix in `Node` methods.
 */

Object.getOwnPropertyNames(_node2.default.prototype).forEach(function (method) {
  if (method == 'constructor') return;
  Inline.prototype[method] = _node2.default.prototype[method];
});

/**
 * Export.
 *
 * @type {Inline}
 */

exports.default = Inline;