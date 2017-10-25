'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _normalize = require('../utils/normalize');

var _normalize2 = _interopRequireDefault(_normalize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Changes.
 *
 * @type {Object}
 */

var Changes = {};

/**
 * Add a `mark` to the characters in the current selection.
 *
 * @param {Change} change
 * @param {Mark} mark
 */

Changes.addMark = function (change, mark) {
  mark = _normalize2.default.mark(mark);

  var state = change.state;
  var document = state.document,
      selection = state.selection;


  if (selection.isExpanded) {
    change.addMarkAtRange(selection, mark);
    return;
  }

  if (selection.marks) {
    var _marks = selection.marks.add(mark);
    var _sel = selection.set('marks', _marks);
    change.select(_sel);
    return;
  }

  var marks = document.getActiveMarksAtRange(selection).add(mark);
  var sel = selection.set('marks', marks);
  change.select(sel);
};

/**
 * Delete at the current selection.
 *
 * @param {Change} change
 */

Changes.delete = function (change) {
  var state = change.state;
  var selection = state.selection;

  if (selection.isCollapsed) return;

  change.deleteAtRange(selection)
  // Ensure that the selection is collapsed to the start, because in certain
  // cases when deleting across inline nodes this isn't guaranteed.
  .collapseToStart();
};

/**
 * Delete backward `n` characters at the current selection.
 *
 * @param {Change} change
 * @param {Number} n (optional)
 */

Changes.deleteBackward = function (change) {
  var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var state = change.state;
  var selection = state.selection;

  change.deleteBackwardAtRange(selection, n);
};

/**
 * Delete backward until the character boundary at the current selection.
 *
 * @param {Change} change
 */

Changes.deleteCharBackward = function (change) {
  var state = change.state;
  var selection = state.selection;

  change.deleteCharBackwardAtRange(selection);
};

/**
 * Delete backward until the line boundary at the current selection.
 *
 * @param {Change} change
 */

Changes.deleteLineBackward = function (change) {
  var state = change.state;
  var selection = state.selection;

  change.deleteLineBackwardAtRange(selection);
};

/**
 * Delete backward until the word boundary at the current selection.
 *
 * @param {Change} change
 */

Changes.deleteWordBackward = function (change) {
  var state = change.state;
  var selection = state.selection;

  change.deleteWordBackwardAtRange(selection);
};

/**
 * Delete forward `n` characters at the current selection.
 *
 * @param {Change} change
 * @param {Number} n (optional)
 */

Changes.deleteForward = function (change) {
  var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var state = change.state;
  var selection = state.selection;

  change.deleteForwardAtRange(selection, n);
};

/**
 * Delete forward until the character boundary at the current selection.
 *
 * @param {Change} change
 */

Changes.deleteCharForward = function (change) {
  var state = change.state;
  var selection = state.selection;

  change.deleteCharForwardAtRange(selection);
};

/**
 * Delete forward until the line boundary at the current selection.
 *
 * @param {Change} change
 */

Changes.deleteLineForward = function (change) {
  var state = change.state;
  var selection = state.selection;

  change.deleteLineForwardAtRange(selection);
};

/**
 * Delete forward until the word boundary at the current selection.
 *
 * @param {Change} change
 */

Changes.deleteWordForward = function (change) {
  var state = change.state;
  var selection = state.selection;

  change.deleteWordForwardAtRange(selection);
};

/**
 * Insert a `block` at the current selection.
 *
 * @param {Change} change
 * @param {String|Object|Block} block
 */

Changes.insertBlock = function (change, block) {
  block = _normalize2.default.block(block);
  var state = change.state;
  var selection = state.selection;

  change.insertBlockAtRange(selection, block);

  // If the node was successfully inserted, update the selection.
  var node = change.state.document.getNode(block.key);
  if (node) change.collapseToEndOf(node);
};

/**
 * Insert a `fragment` at the current selection.
 *
 * @param {Change} change
 * @param {Document} fragment
 */

Changes.insertFragment = function (change, fragment) {
  var state = change.state;
  var _state = state,
      document = _state.document,
      selection = _state.selection;


  if (!fragment.nodes.size) return;

  var _state2 = state,
      startText = _state2.startText,
      endText = _state2.endText;

  var lastText = fragment.getLastText();
  var lastInline = fragment.getClosestInline(lastText.key);
  var keys = document.getTexts().map(function (text) {
    return text.key;
  });
  var isAppending = selection.hasEdgeAtEndOf(endText) || selection.hasEdgeAtStartOf(startText);

  change.insertFragmentAtRange(selection, fragment);
  state = change.state;
  document = state.document;

  var newTexts = document.getTexts().filter(function (n) {
    return !keys.includes(n.key);
  });
  var newText = isAppending ? newTexts.last() : newTexts.takeLast(2).first();
  var after = void 0;

  if (newText && lastInline) {
    after = selection.collapseToEndOf(newText);
  } else if (newText) {
    after = selection.collapseToStartOf(newText).move(lastText.text.length);
  } else {
    after = selection.collapseToStart().move(lastText.text.length);
  }

  change.select(after);
};

/**
 * Insert a `inline` at the current selection.
 *
 * @param {Change} change
 * @param {String|Object|Block} inline
 */

Changes.insertInline = function (change, inline) {
  inline = _normalize2.default.inline(inline);
  var state = change.state;
  var selection = state.selection;

  change.insertInlineAtRange(selection, inline);

  // If the node was successfully inserted, update the selection.
  var node = change.state.document.getNode(inline.key);
  if (node) change.collapseToEndOf(node);
};

/**
 * Insert a `text` string at the current selection.
 *
 * @param {Change} change
 * @param {String} text
 * @param {Set<Mark>} marks (optional)
 */

Changes.insertText = function (change, text, marks) {
  var state = change.state;
  var document = state.document,
      selection = state.selection;

  marks = marks || selection.marks;

  change.insertTextAtRange(selection, text, marks);

  // If the text was successfully inserted, and the selection had marks on it,
  // unset the selection's marks.
  if (selection.marks && document != change.state.document) {
    change.select({ marks: null });
  }
};

/**
 * Set `properties` of the block nodes in the current selection.
 *
 * @param {Change} change
 * @param {Object} properties
 */

Changes.setBlock = function (change, properties) {
  var state = change.state;
  var selection = state.selection;

  change.setBlockAtRange(selection, properties);
};

/**
 * Set `properties` of the inline nodes in the current selection.
 *
 * @param {Change} change
 * @param {Object} properties
 */

Changes.setInline = function (change, properties) {
  var state = change.state;
  var selection = state.selection;

  change.setInlineAtRange(selection, properties);
};

/**
 * Split the block node at the current selection, to optional `depth`.
 *
 * @param {Change} change
 * @param {Number} depth (optional)
 */

Changes.splitBlock = function (change) {
  var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var state = change.state;
  var selection = state.selection;

  change.splitBlockAtRange(selection, depth).collapseToEnd();
};

/**
 * Split the inline nodes at the current selection, to optional `depth`.
 *
 * @param {Change} change
 * @param {Number} depth (optional)
 */

Changes.splitInline = function (change) {
  var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Infinity;
  var state = change.state;
  var selection = state.selection;

  change.splitInlineAtRange(selection, depth);
};

/**
 * Remove a `mark` from the characters in the current selection.
 *
 * @param {Change} change
 * @param {Mark} mark
 */

Changes.removeMark = function (change, mark) {
  mark = _normalize2.default.mark(mark);
  var state = change.state;
  var document = state.document,
      selection = state.selection;


  if (selection.isExpanded) {
    change.removeMarkAtRange(selection, mark);
    return;
  }

  if (selection.marks) {
    var _marks2 = selection.marks.remove(mark);
    var _sel2 = selection.set('marks', _marks2);
    change.select(_sel2);
    return;
  }

  var marks = document.getActiveMarksAtRange(selection).remove(mark);
  var sel = selection.set('marks', marks);
  change.select(sel);
};

/**
 * Add or remove a `mark` from the characters in the current selection,
 * depending on whether it's already there.
 *
 * @param {Change} change
 * @param {Mark} mark
 */

Changes.toggleMark = function (change, mark) {
  mark = _normalize2.default.mark(mark);
  var state = change.state;

  var exists = state.activeMarks.some(function (m) {
    return m.equals(mark);
  });

  if (exists) {
    change.removeMark(mark);
  } else {
    change.addMark(mark);
  }
};

/**
 * Unwrap the current selection from a block parent with `properties`.
 *
 * @param {Change} change
 * @param {Object|String} properties
 */

Changes.unwrapBlock = function (change, properties) {
  var state = change.state;
  var selection = state.selection;

  change.unwrapBlockAtRange(selection, properties);
};

/**
 * Unwrap the current selection from an inline parent with `properties`.
 *
 * @param {Change} change
 * @param {Object|String} properties
 */

Changes.unwrapInline = function (change, properties) {
  var state = change.state;
  var selection = state.selection;

  change.unwrapInlineAtRange(selection, properties);
};

/**
 * Wrap the block nodes in the current selection with a new block node with
 * `properties`.
 *
 * @param {Change} change
 * @param {Object|String} properties
 */

Changes.wrapBlock = function (change, properties) {
  var state = change.state;
  var selection = state.selection;

  change.wrapBlockAtRange(selection, properties);
};

/**
 * Wrap the current selection in new inline nodes with `properties`.
 *
 * @param {Change} change
 * @param {Object|String} properties
 */

Changes.wrapInline = function (change, properties) {
  var state = change.state;
  var selection = state.selection;

  change.wrapInlineAtRange(selection, properties);
};

/**
 * Wrap the current selection with prefix/suffix.
 *
 * @param {Change} change
 * @param {String} prefix
 * @param {String} suffix
 */

Changes.wrapText = function (change, prefix) {
  var suffix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : prefix;
  var state = change.state;
  var selection = state.selection;

  change.wrapTextAtRange(selection, prefix, suffix);

  // If the selection was collapsed, it will have moved the start offset too.
  if (selection.isCollapsed) {
    change.moveStart(0 - prefix.length);
  }

  // Adding the suffix will have pushed the end of the selection further on, so
  // we need to move it back to account for this.
  change.moveEnd(0 - suffix.length);

  // There's a chance that the selection points moved "through" each other,
  // resulting in a now-incorrect selection direction.
  if (selection.isForward != change.state.selection.isForward) {
    change.flip();
  }
};

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Changes;