'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _templateObject = _taggedTemplateLiteral([''], ['']);

var _block = require('../models/block');

var _block2 = _interopRequireDefault(_block);

var _document = require('../models/document');

var _document2 = _interopRequireDefault(_document);

var _inline = require('../models/inline');

var _inline2 = _interopRequireDefault(_inline);

var _data = require('../models/data');

var _data2 = _interopRequireDefault(_data);

var _mark = require('../models/mark');

var _mark2 = _interopRequireDefault(_mark);

var _selection = require('../models/selection');

var _selection2 = _interopRequireDefault(_selection);

var _text = require('../models/text');

var _text2 = _interopRequireDefault(_text);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _typeOf = require('type-of');

var _typeOf2 = _interopRequireDefault(_typeOf);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

/**
 * Normalize a block argument `value`.
 *
 * @param {Block|String|Object} value
 * @return {Block}
 */

function block(value) {
  if (_block2.default.isBlock(value)) return value;

  if (_inline2.default.isInline(value) || _mark2.default.isMark(value) || _text2.default.isText(value) || _selection2.default.isSelection(value)) {
    throw new Error('Invalid `block` argument! It must be a block, an object, or a string. You passed: ' + value);
  }

  switch ((0, _typeOf2.default)(value)) {
    case 'string':
    case 'object':
      {
        return _block2.default.create(nodeProperties(value));
      }
    default:
      {
        throw new Error('Invalid `block` argument! It must be a block, an object, or a string. You passed: ' + value);
      }
  }
}

/**
 * Normalize an inline argument `value`.
 *
 * @param {Inline|String|Object} value
 * @return {Inline}
 */

function inline(value) {
  if (_inline2.default.isInline(value)) return value;

  if (_block2.default.isBlock(value) || _mark2.default.isMark(value) || _text2.default.isText(value) || _selection2.default.isSelection(value)) {
    throw new Error('Invalid `inline` argument! It must be an inline, an object, or a string. You passed: ' + value);
  }

  switch ((0, _typeOf2.default)(value)) {
    case 'string':
    case 'object':
      {
        return _inline2.default.create(nodeProperties(value));
      }
    default:
      {
        throw new Error('Invalid `inline` argument! It must be an inline, an object, or a string. You passed: ' + value);
      }
  }
}

/**
 * Normalize an text argument `value`.
 *
 * @param {Text|String|Object} value
 * @return {Text}
 */

function text(value) {
  if (_text2.default.isText(value)) return value;

  if (_block2.default.isBlock(value) || _inline2.default.isInline(value) || _mark2.default.isMark(value) || _selection2.default.isSelection(value)) {
    throw new Error('Invalid `text` argument! It must be a text, an object, or a string. You passed: ' + value);
  }

  switch ((0, _typeOf2.default)(value)) {
    case 'object':
      {
        return _text2.default.create(value);
      }
    default:
      {
        throw new Error('Invalid `text` argument! It must be an text, an object, or a string. You passed: ' + value);
      }
  }
}

/**
 * Normalize a node `value`.
 *
 * @param {Node|Object} value
 * @return {Node}
 */

function node(value) {
  if (_block2.default.isBlock(value)) return value;
  if (_document2.default.isDocument(value)) return value;
  if (_inline2.default.isInline(value)) return value;
  if (_text2.default.isText(value)) return value;

  switch ((0, _typeOf2.default)(value)) {
    case 'object':
      {
        switch (value.kind) {
          case 'block':
            return block(value);
          case 'inline':
            return inline(value);
          case 'text':
            return text(value);
          default:
            {
              throw new Error('Invalid `node.kind` property. It must be either "block" or "inline". You passed: ' + value);
            }
        }
      }
    default:
      {
        throw new Error('Invalid `node` argument! It must be a block, an inline, a text, or an object. You passed: ' + value);
      }
  }
}

/**
 * Normalize a key argument `value`.
 *
 * @param {String|Node} value
 * @return {String}
 */

function key(value) {
  if ((0, _typeOf2.default)(value) == 'string') return value;

  _logger2.default.warn('An object was passed to a Node method instead of a `key` string. This was previously supported, but is being deprecated because it can have a negative impact on performance. The object in question was:', value);

  if (_block2.default.isBlock(value) || _document2.default.isDocument(value) || _inline2.default.isInline(value) || _text2.default.isText(value)) {
    return value.key;
  }

  throw new Error('Invalid `key` argument! It must be either a block, an inline, a text, or a string. You passed: ' + value);
}

/**
 * Normalize a mark argument `value`.
 *
 * @param {Mark|String|Object} value
 * @return {Mark}
 */

function mark(value) {
  if (_mark2.default.isMark(value)) return value;
  if (_block2.default.isBlock(value) || _inline2.default.isInline(value) || _text2.default.isText(value) || _selection2.default.isSelection(value)) {
    throw new Error('Invalid `mark` argument! It must be a mark, an object, or a string. You passed: ' + value);
  }

  switch ((0, _typeOf2.default)(value)) {
    case 'string':
    case 'object':
      {
        return _mark2.default.create(markProperties(value));
      }
    default:
      {
        throw new Error('Invalid `mark` argument! It must be a mark, an object, or a string. You passed: ' + value);
      }
  }
}

/**
 * Normalize a set of marks argument `values`.
 *
 * @param {Set<Marks>|Array} values
 * @return {Set<Marks>}
 */

function marks(values) {
  if (_immutable.Set.isSet(values)) return values;

  switch ((0, _typeOf2.default)(values)) {
    case 'array':
      {
        return _mark2.default.createSet(values);
      }
    case 'null':
      {
        return null;
      }
    default:
      {
        throw new Error('Invalid `marks` argument! It must be a set of marks or an array. You passed: ' + values);
      }
  }
}

/**
 * Normalize a mark properties argument `value`.
 *
 * @param {String|Object|Mark} value
 * @return {Object}
 */

function markProperties() {
  var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var ret = {};

  switch ((0, _typeOf2.default)(value)) {
    case 'string':
      {
        ret.type = value;
        break;
      }
    case 'object':
      {
        for (var k in value) {
          if (k == 'data') {
            if (value[k] !== undefined) ret[k] = _data2.default.create(value[k]);
          } else if (!k.startsWith('@@__SLATE')) {
            ret[k] = value[k];
          }
        }
        break;
      }
    default:
      {
        throw new Error('Invalid mark `properties` argument! It must be an object, a string or a mark. You passed: ' + value);
      }
  }

  return ret;
}

/**
 * Normalize a node properties argument `value`.
 *
 * @param {String|Object|Node} value
 * @return {Object}
 */

function nodeProperties() {
  var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var ret = {};

  switch ((0, _typeOf2.default)(value)) {
    case 'string':
      {
        ret.type = value;
        break;
      }
    case 'object':
      {
        if (value.isVoid !== undefined) ret.isVoid = !!value.isVoid;
        for (var k in value) {
          if (k == 'data') {
            if (value[k] !== undefined) ret[k] = _data2.default.create(value[k]);
          } else if (!k.startsWith('@@__SLATE')) {
            ret[k] = value[k];
          }
        }
        break;
      }
    default:
      {
        throw new Error('Invalid node `properties` argument! It must be an object, a string or a node. You passed: ' + value);
      }
  }

  return ret;
}

/**
 * Normalize a selection argument `value`.
 *
 * @param {Selection|Object} value
 * @return {Selection}
 */

function selection(value) {
  if (_selection2.default.isSelection(value)) return value;
  if (_mark2.default.isMark(value) || _block2.default.isBlock(value) || _inline2.default.isInline(value) || _text2.default.isText(value)) {
    throw new Error('Invalid `selection` argument! It must be a selection or an object. You passed: ' + value)(_templateObject);
  }

  switch ((0, _typeOf2.default)(value)) {
    case 'object':
      {
        return _selection2.default.create(value);
      }
    default:
      {
        throw new Error('Invalid `selection` argument! It must be a selection or an object. You passed: ' + value);
      }
  }
}

/**
 * Normalize a selection properties argument `value`.
 *
 * @param {Object|Selection} value
 * @return {Object}
 */

function selectionProperties() {
  var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var ret = {};

  switch ((0, _typeOf2.default)(value)) {
    case 'object':
      {
        if (value.anchorKey !== undefined) ret.anchorKey = value.anchorKey;
        if (value.anchorOffset !== undefined) ret.anchorOffset = value.anchorOffset;
        if (value.focusKey !== undefined) ret.focusKey = value.focusKey;
        if (value.focusOffset !== undefined) ret.focusOffset = value.focusOffset;
        if (value.isBackward !== undefined) ret.isBackward = !!value.isBackward;
        if (value.isFocused !== undefined) ret.isFocused = !!value.isFocused;
        if (value.marks !== undefined) ret.marks = value.marks;
        break;
      }
    default:
      {
        throw new Error('Invalid selection `properties` argument! It must be an object or a selection. You passed: ' + value);
      }
  }

  return ret;
}

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = {
  block: block,
  inline: inline,
  node: node,
  key: key,
  mark: mark,
  marks: marks,
  markProperties: markProperties,
  nodeProperties: nodeProperties,
  selection: selection,
  selectionProperties: selectionProperties,
  text: text
};