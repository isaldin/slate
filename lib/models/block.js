'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('./document');

var _data = require('./data');

var _data2 = _interopRequireDefault(_data);

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

var _inline = require('./inline');

var _inline2 = _interopRequireDefault(_inline);

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
 * Block.
 *
 * @type {Block}
 */

var Block = function (_ref) {
  _inherits(Block, _ref);

  function Block() {
    _classCallCheck(this, Block);

    return _possibleConstructorReturn(this, (Block.__proto__ || Object.getPrototypeOf(Block)).apply(this, arguments));
  }

  _createClass(Block, [{
    key: 'kind',


    /**
     * Get the node's kind.
     *
     * @return {String}
     */

    get: function get() {
      return 'block';
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
     * Create a new `Block` with `attrs`.
     *
     * @param {Object|Block} attrs
     * @return {Block}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Block.isBlock(attrs)) return attrs;
      if (_inline2.default.isInline(attrs)) return attrs;
      if (_text2.default.isText(attrs)) return attrs;

      if (!attrs.type) {
        throw new Error('You must pass a block `type`.');
      }

      var nodes = attrs.nodes;

      var empty = !nodes || nodes.size == 0 || nodes.length == 0;
      var block = new Block({
        type: attrs.type,
        key: attrs.key || (0, _generateKey2.default)(),
        data: _data2.default.create(attrs.data),
        isVoid: !!attrs.isVoid,
        nodes: _node2.default.createList(empty ? [_text2.default.create()] : nodes)
      });

      return block;
    }

    /**
     * Create a list of `Blocks` from `elements`.
     *
     * @param {Array<Object|Block>|List<Block>} elements
     * @return {List<Block>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (_immutable.List.isList(elements)) {
        return elements;
      }

      if (Array.isArray(elements)) {
        var list = new _immutable.List(elements.map(Block.create));
        return list;
      }

      throw new Error('Block.createList() must be passed an `Array` or a `List`. You passed: ' + elements);
    }

    /**
     * Check if a `value` is a `Block`.
     *
     * @param {Any} value
     * @return {Boolean}
     */

  }, {
    key: 'isBlock',
    value: function isBlock(value) {
      return !!(value && value[_modelTypes2.default.BLOCK]);
    }
  }]);

  return Block;
}(new _immutable.Record(DEFAULTS));

/**
 * Attach a pseudo-symbol for type checking.
 */

Block.prototype[_modelTypes2.default.BLOCK] = true;

/**
 * Mix in `Node` methods.
 */

Object.getOwnPropertyNames(_node2.default.prototype).forEach(function (method) {
  if (method == 'constructor') return;
  Block.prototype[method] = _node2.default.prototype[method];
});

/**
 * Export.
 *
 * @type {Block}
 */

exports.default = Block;