'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _block = require('../models/block');

var _block2 = _interopRequireDefault(_block);

var _character = require('../models/character');

var _character2 = _interopRequireDefault(_character);

var _document = require('../models/document');

var _document2 = _interopRequireDefault(_document);

var _inline = require('../models/inline');

var _inline2 = _interopRequireDefault(_inline);

var _mark = require('../models/mark');

var _mark2 = _interopRequireDefault(_mark);

var _range = require('../models/range');

var _range2 = _interopRequireDefault(_range);

var _schema = require('../models/schema');

var _schema2 = _interopRequireDefault(_schema);

var _selection = require('../models/selection');

var _selection2 = _interopRequireDefault(_selection);

var _state = require('../models/state');

var _state2 = _interopRequireDefault(_state);

var _text = require('../models/text');

var _text2 = _interopRequireDefault(_text);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * HOC Function that takes in a predicate prop type function, and allows an isRequired chain
 *
 * @param {Function} predicate
 * @return {Function}
 */

function createChainablePropType(predicate) {
  function propType(props, propName, componentName) {
    if (props[propName] == null) return;

    return predicate(props, propName, componentName);
  }

  propType.isRequired = function (props, propName, componentName) {
    if (props[propName] == null) return new Error('Required prop `' + propName + '` was not specified in `' + componentName + '`.');

    return predicate(props, propName, componentName);
  };

  return propType;
}

/**
 * Exported Slate proptype that checks if a prop is a Slate Block
 *
 * @type {Function}
 */

var block = createChainablePropType(function (props, propName, componentName) {
  return !_block2.default.isBlock(props[propName]) ? new Error(propName + ' in ' + componentName + ' is not a Slate Block') : null;
});

/**
 * Exported Slate proptype that checks if a prop is a Slate Character
 *
 * @type {Function}
 */

var character = createChainablePropType(function (props, propName, componentName) {
  return !_character2.default.isCharacter(props[propName]) ? new Error(propName + ' in ' + componentName + ' is not a Slate Character') : null;
});

/**
 * Exported Slate proptype that checks if a prop is a Slate Document
 *
 * @type {Function}
 */

var document = createChainablePropType(function (props, propName, componentName) {
  return !_document2.default.isDocument(props[propName]) ? new Error(propName + ' in ' + componentName + ' is not a Slate Document') : null;
});

/**
 * Exported Slate proptype that checks if a prop is a Slate Inline
 *
 * @type {Function}
 */

var inline = createChainablePropType(function (props, propName, componentName) {
  return !_inline2.default.isInline(props[propName]) ? new Error(propName + ' in ' + componentName + ' is not a Slate Inline') : null;
});

/**
 * Exported Slate proptype that checks if a prop is a Slate Mark
 *
 * @type {Function}
 */

var mark = createChainablePropType(function (props, propName, componentName) {
  return !_mark2.default.isMark(props[propName]) ? new Error(propName + ' in ' + componentName + ' is not a Slate Mark') : null;
});

/**
 * Exported Slate proptype that checks if a prop is a Slate Range
 *
 * @type {Function}
 */

var range = createChainablePropType(function (props, propName, componentName) {
  return !_range2.default.isRange(props[propName]) ? new Error(propName + ' in ' + componentName + ' is not a Slate Range') : null;
});

/**
 * Exported Slate proptype that checks if a prop is a Slate Schema
 *
 * @type {Function}
 */

var schema = createChainablePropType(function (props, propName, componentName) {
  return !_schema2.default.isSchema(props[propName]) ? new Error(propName + ' in ' + componentName + ' is not a Slate Schema') : null;
});

/**
 * Exported Slate proptype that checks if a prop is a Slate Selection
 *
 * @type {Function}
 */

var selection = createChainablePropType(function (props, propName, componentName) {
  return !_selection2.default.isSelection(props[propName]) ? new Error(propName + ' in ' + componentName + ' is not a Slate Selection') : null;
});

/**
 * Exported Slate proptype that checks if a prop is a Slate State
 *
 * @type {Function}
 */

var state = createChainablePropType(function (props, propName, componentName) {
  return !_state2.default.isState(props[propName]) ? new Error(propName + ' in ' + componentName + ' is not a Slate State ' + props[propName]) : null;
});

/**
 * Exported Slate proptype that checks if a prop is a Slate Text
 *
 * @type {Function}
 */

var text = createChainablePropType(function (props, propName, componentName) {
  return !_text2.default.isText(props[propName]) ? new Error(propName + ' in ' + componentName + ' is not a Slate Text') : null;
});

/**
 * Exported Slate proptypes
 *
 * @type {Object}
 */

exports.default = {
  block: block,
  character: character,
  document: document,
  inline: inline,
  mark: mark,
  range: range,
  schema: schema,
  selection: selection,
  state: state,
  text: text
};