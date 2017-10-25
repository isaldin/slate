'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _normalize = require('../utils/normalize');

var _normalize2 = _interopRequireDefault(_normalize);

var _string = require('../utils/string');

var _string2 = _interopRequireDefault(_string);

var _core = require('../schemas/core');

var _core2 = _interopRequireDefault(_core);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Changes.
 *
 * @type {Object}
 */

var Changes = {};

/**
 * An options object with normalize set to `false`.
 *
 * @type {Object}
 */

var OPTS = {
  normalize: false
};

/**
 * Add a new `mark` to the characters at `range`.
 *
 * @param {Change} change
 * @param {Selection} range
 * @param {Mixed} mark
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.addMarkAtRange = function (change, range, mark) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  if (range.isCollapsed) return;

  var _options$normalize = options.normalize,
      normalize = _options$normalize === undefined ? true : _options$normalize;
  var state = change.state;
  var document = state.document;
  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;

  var texts = document.getTextsAtRange(range);

  texts.forEach(function (node) {
    var key = node.key;

    var index = 0;
    var length = node.text.length;

    if (key == startKey) index = startOffset;
    if (key == endKey) length = endOffset;
    if (key == startKey && key == endKey) length = endOffset - startOffset;

    change.addMarkByKey(key, index, length, mark, { normalize: normalize });
  });
};

/**
 * Delete everything in a `range`.
 *
 * @param {Change} change
 * @param {Selection} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteAtRange = function (change, range) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (range.isCollapsed) return;

  change.snapshotSelection();

  var _options$normalize2 = options.normalize,
      normalize = _options$normalize2 === undefined ? true : _options$normalize2;
  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;

  // Split at the range edges within a common ancestor, without normalizing.

  var state = change.state;
  var _state = state,
      document = _state.document;

  var ancestor = document.getCommonAncestor(startKey, endKey);
  var startChild = ancestor.getFurthestAncestor(startKey);
  var endChild = ancestor.getFurthestAncestor(endKey);

  // If the start child is a void node, and the range begins or
  // ends (when range is backward) at the start of it, remove it
  // and set nextSibling as startChild until there is no startChild
  // that is a void node and included in the selection range
  var startChildIncludesVoid = startChild.isVoid && (range.anchorOffset === 0 && !range.isBackward || range.focusOffset === 0 && range.isBackward);

  while (startChildIncludesVoid) {
    var nextSibling = document.getNextSibling(startChild.key);
    change.removeNodeByKey(startChild.key, OPTS);
    // Abort if no nextSibling or we are about to process the endChild which is aslo a void node
    if (!nextSibling || endChild.key === nextSibling.key && nextSibling.isVoid) {
      startChildIncludesVoid = false;
      return;
    }
    // Process the next void
    if (nextSibling.isVoid) {
      startChild = nextSibling;
    }
    // Set the startChild, startKey and startOffset in the beginning of the next non void sibling
    if (!nextSibling.isVoid) {
      startChild = nextSibling;
      if (startChild.getTexts) {
        startKey = startChild.getTexts().first().key;
      } else {
        startKey = startChild.key;
      }
      startOffset = 0;
      startChildIncludesVoid = false;
    }
  }

  // If the start child is a void node, and the range ends or
  // begins (when range is backward) at the end of it move to nextSibling
  var startChildEndOfVoid = startChild.isVoid && (range.anchorOffset === 1 && !range.isBackward || range.focusOffset === 1 && range.isBackward);

  if (startChildEndOfVoid) {
    var _nextSibling = document.getNextSibling(startChild.key);
    if (_nextSibling) {
      startChild = _nextSibling;
      if (startChild.getTexts) {
        startKey = startChild.getTexts().first().key;
      } else {
        startKey = startChild.key;
      }
      startOffset = 0;
    }
  }

  // If the start and end key are the same, we can just remove it.
  if (startKey == endKey) {
    // If it is a void node, remove the whole node
    if (ancestor.isVoid) {
      // Deselect if this is the only node left in document
      if (document.nodes.size === 1) {
        change.deselect();
      }
      change.removeNodeByKey(ancestor.key, OPTS);
      return;
    }
    // Remove the text
    var index = startOffset;
    var length = endOffset - startOffset;
    change.removeTextByKey(startKey, index, length, { normalize: normalize });
    return;
  }

  // Split at the range edges within a common ancestor, without normalizing.
  state = change.state;
  document = state.document;
  ancestor = document.getCommonAncestor(startKey, endKey);
  startChild = ancestor.getFurthestAncestor(startKey);
  endChild = ancestor.getFurthestAncestor(endKey);

  if (startChild.kind == 'text') {
    change.splitNodeByKey(startChild.key, startOffset, OPTS);
  } else {
    change.splitDescendantsByKey(startChild.key, startKey, startOffset, OPTS);
  }

  if (endChild.kind == 'text') {
    change.splitNodeByKey(endChild.key, endOffset, OPTS);
  } else {
    change.splitDescendantsByKey(endChild.key, endKey, endOffset, OPTS);
  }

  // Refresh variables.
  state = change.state;
  document = state.document;
  ancestor = document.getCommonAncestor(startKey, endKey);
  startChild = ancestor.getFurthestAncestor(startKey);
  endChild = ancestor.getFurthestAncestor(endKey);
  var startIndex = ancestor.nodes.indexOf(startChild);
  var endIndex = ancestor.nodes.indexOf(endChild);
  var middles = ancestor.nodes.slice(startIndex + 1, endIndex + 1);
  var next = document.getNextText(endKey);

  // Remove all of the middle nodes, between the splits.
  if (middles.size) {
    middles.forEach(function (child) {
      change.removeNodeByKey(child.key, OPTS);
    });
  }

  // If the start and end block are different, move all of the nodes from the
  // end block into the start block.
  state = change.state;
  document = state.document;
  var startBlock = document.getClosestBlock(startKey);
  var endBlock = document.getClosestBlock(next.key);

  // If the endBlock is void, just remove the startBlock
  if (endBlock.isVoid) {
    change.removeNodeByKey(startBlock.key);
    return;
  }

  // If the start and end block are different, move all of the nodes from the
  // end block into the start block
  if (startBlock.key !== endBlock.key) {
    endBlock.nodes.forEach(function (child, i) {
      var newKey = startBlock.key;
      var newIndex = startBlock.nodes.size + i;
      change.moveNodeByKey(child.key, newKey, newIndex, OPTS);
    });

    // Remove parents of endBlock as long as they have a single child
    var lonely = document.getFurthestOnlyChildAncestor(endBlock.key) || endBlock;
    change.removeNodeByKey(lonely.key, OPTS);
  }

  if (normalize) {
    change.normalizeNodeByKey(ancestor.key, _core2.default);
  }
};

/**
 * Delete backward until the character boundary at a `range`.
 *
 * @param {Change} change
 * @param {Selection} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteCharBackwardAtRange = function (change, range, options) {
  var state = change.state;
  var document = state.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  var text = startBlock.text;

  var n = _string2.default.getCharOffsetBackward(text, o);
  change.deleteBackwardAtRange(range, n, options);
};

/**
 * Delete backward until the line boundary at a `range`.
 *
 * @param {Change} change
 * @param {Selection} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteLineBackwardAtRange = function (change, range, options) {
  var state = change.state;
  var document = state.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  change.deleteBackwardAtRange(range, o, options);
};

/**
 * Delete backward until the word boundary at a `range`.
 *
 * @param {Change} change
 * @param {Selection} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteWordBackwardAtRange = function (change, range, options) {
  var state = change.state;
  var document = state.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  var text = startBlock.text;

  var n = _string2.default.getWordOffsetBackward(text, o);
  change.deleteBackwardAtRange(range, n, options);
};

/**
 * Delete backward `n` characters at a `range`.
 *
 * @param {Change} change
 * @param {Selection} range
 * @param {Number} n (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteBackwardAtRange = function (change, range) {
  var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize3 = options.normalize,
      normalize = _options$normalize3 === undefined ? true : _options$normalize3;
  var state = change.state;
  var document = state.document;
  var _range = range,
      startKey = _range.startKey,
      focusOffset = _range.focusOffset;

  // If the range is expanded, perform a regular delete instead.

  if (range.isExpanded) {
    change.deleteAtRange(range, { normalize: normalize });
    return;
  }

  var block = document.getClosestBlock(startKey);
  // If the closest block is void, delete it.
  if (block && block.isVoid) {
    change.removeNodeByKey(block.key, { normalize: normalize });
    return;
  }
  // If the closest is not void, but empty, remove it
  if (block && !block.isVoid && block.isEmpty && document.nodes.size !== 1) {
    change.removeNodeByKey(block.key, { normalize: normalize });
    return;
  }

  // If the closest inline is void, delete it.
  var inline = document.getClosestInline(startKey);
  if (inline && inline.isVoid) {
    change.removeNodeByKey(inline.key, { normalize: normalize });
    return;
  }

  // If the range is at the start of the document, abort.
  if (range.isAtStartOf(document)) {
    return;
  }

  // If the range is at the start of the text node, we need to figure out what
  // is behind it to know how to delete...
  var text = document.getDescendant(startKey);
  if (range.isAtStartOf(text)) {
    var prev = document.getPreviousText(text.key);
    var prevBlock = document.getClosestBlock(prev.key);
    var prevInline = document.getClosestInline(prev.key);

    // If the previous block is void, remove it.
    if (prevBlock && prevBlock.isVoid) {
      change.removeNodeByKey(prevBlock.key, { normalize: normalize });
      return;
    }

    // If the previous inline is void, remove it.
    if (prevInline && prevInline.isVoid) {
      change.removeNodeByKey(prevInline.key, { normalize: normalize });
      return;
    }

    // If we're deleting by one character and the previous text node is not
    // inside the current block, we need to merge the two blocks together.
    if (n == 1 && prevBlock != block) {
      range = range.merge({
        anchorKey: prev.key,
        anchorOffset: prev.text.length
      });

      change.deleteAtRange(range, { normalize: normalize });
      return;
    }
  }

  // If the focus offset is farther than the number of characters to delete,
  // just remove the characters backwards inside the current node.
  if (n < focusOffset) {
    range = range.merge({
      focusOffset: focusOffset - n,
      isBackward: true
    });

    change.deleteAtRange(range, { normalize: normalize });
    return;
  }

  // Otherwise, we need to see how many nodes backwards to go.
  var node = text;
  var offset = 0;
  var traversed = focusOffset;

  while (n > traversed) {
    node = document.getPreviousText(node.key);
    var next = traversed + node.text.length;
    if (n <= next) {
      offset = next - n;
      break;
    } else {
      traversed = next;
    }
  }

  // If the focus node is inside a void, go up until right after it.
  if (document.hasVoidParent(node.key)) {
    var parent = document.getClosestVoid(node.key);
    node = document.getNextText(parent.key);
    offset = 0;
  }

  range = range.merge({
    focusKey: node.key,
    focusOffset: offset,
    isBackward: true
  });

  change.deleteAtRange(range, { normalize: normalize });
};

/**
 * Delete forward until the character boundary at a `range`.
 *
 * @param {Change} change
 * @param {Selection} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteCharForwardAtRange = function (change, range, options) {
  var state = change.state;
  var document = state.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  var text = startBlock.text;

  var n = _string2.default.getCharOffsetForward(text, o);
  change.deleteForwardAtRange(range, n, options);
};

/**
 * Delete forward until the line boundary at a `range`.
 *
 * @param {Change} change
 * @param {Selection} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteLineForwardAtRange = function (change, range, options) {
  var state = change.state;
  var document = state.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  change.deleteForwardAtRange(range, o, options);
};

/**
 * Delete forward until the word boundary at a `range`.
 *
 * @param {Change} change
 * @param {Selection} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteWordForwardAtRange = function (change, range, options) {
  var state = change.state;
  var document = state.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  var text = startBlock.text;

  var n = _string2.default.getWordOffsetForward(text, o);
  change.deleteForwardAtRange(range, n, options);
};

/**
 * Delete forward `n` characters at a `range`.
 *
 * @param {Change} change
 * @param {Selection} range
 * @param {Number} n (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteForwardAtRange = function (change, range) {
  var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize4 = options.normalize,
      normalize = _options$normalize4 === undefined ? true : _options$normalize4;
  var state = change.state;
  var document = state.document;
  var _range2 = range,
      startKey = _range2.startKey,
      focusOffset = _range2.focusOffset;

  // If the range is expanded, perform a regular delete instead.

  if (range.isExpanded) {
    change.deleteAtRange(range, { normalize: normalize });
    return;
  }

  var block = document.getClosestBlock(startKey);
  // If the closest block is void, delete it.
  if (block && block.isVoid) {
    change.removeNodeByKey(block.key, { normalize: normalize });
    return;
  }
  // If the closest is not void, but empty, remove it
  if (block && !block.isVoid && block.isEmpty && document.nodes.size !== 1) {
    change.removeNodeByKey(block.key, { normalize: normalize });
    return;
  }

  // If the closest inline is void, delete it.
  var inline = document.getClosestInline(startKey);
  if (inline && inline.isVoid) {
    change.removeNodeByKey(inline.key, { normalize: normalize });
    return;
  }

  // If the range is at the start of the document, abort.
  if (range.isAtEndOf(document)) {
    return;
  }

  // If the range is at the start of the text node, we need to figure out what
  // is behind it to know how to delete...
  var text = document.getDescendant(startKey);
  if (range.isAtEndOf(text)) {
    var next = document.getNextText(text.key);
    var nextBlock = document.getClosestBlock(next.key);
    var nextInline = document.getClosestInline(next.key);

    // If the previous block is void, remove it.
    if (nextBlock && nextBlock.isVoid) {
      change.removeNodeByKey(nextBlock.key, { normalize: normalize });
      return;
    }

    // If the previous inline is void, remove it.
    if (nextInline && nextInline.isVoid) {
      change.removeNodeByKey(nextInline.key, { normalize: normalize });
      return;
    }

    // If we're deleting by one character and the previous text node is not
    // inside the current block, we need to merge the two blocks together.
    if (n == 1 && nextBlock != block) {
      range = range.merge({
        focusKey: next.key,
        focusOffset: 0
      });

      change.deleteAtRange(range, { normalize: normalize });
      return;
    }
  }

  // If the remaining characters to the end of the node is greater than or equal
  // to the number of characters to delete, just remove the characters forwards
  // inside the current node.
  if (n <= text.text.length - focusOffset) {
    range = range.merge({
      focusOffset: focusOffset + n
    });

    change.deleteAtRange(range, { normalize: normalize });
    return;
  }

  // Otherwise, we need to see how many nodes forwards to go.
  var node = text;
  var offset = focusOffset;
  var traversed = text.text.length - focusOffset;

  while (n > traversed) {
    node = document.getNextText(node.key);
    var _next = traversed + node.text.length;
    if (n <= _next) {
      offset = n - traversed;
      break;
    } else {
      traversed = _next;
    }
  }

  // If the focus node is inside a void, go up until right before it.
  if (document.hasVoidParent(node.key)) {
    var parent = document.getClosestVoid(node.key);
    node = document.getPreviousText(parent.key);
    offset = node.text.length;
  }

  range = range.merge({
    focusKey: node.key,
    focusOffset: offset
  });

  change.deleteAtRange(range, { normalize: normalize });
};

/**
 * Insert a `block` node at `range`.
 *
 * @param {Change} change
 * @param {Selection} range
 * @param {Block|String|Object} block
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.insertBlockAtRange = function (change, range, block) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  block = _normalize2.default.block(block);
  var _options$normalize5 = options.normalize,
      normalize = _options$normalize5 === undefined ? true : _options$normalize5;


  if (range.isExpanded) {
    change.deleteAtRange(range);
    range = range.collapseToStart();
  }

  var state = change.state;
  var document = state.document;
  var _range3 = range,
      startKey = _range3.startKey,
      startOffset = _range3.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var parent = document.getParent(startBlock.key);
  var index = parent.nodes.indexOf(startBlock);

  if (startBlock.isVoid) {
    var extra = range.isAtEndOf(startBlock) ? 1 : 0;
    change.insertNodeByKey(parent.key, index + extra, block, { normalize: normalize });
  } else if (startBlock.isEmpty) {
    change.removeNodeByKey(startBlock.key);
    change.insertNodeByKey(parent.key, index, block, { normalize: normalize });
  } else if (range.isAtStartOf(startBlock)) {
    change.insertNodeByKey(parent.key, index, block, { normalize: normalize });
  } else if (range.isAtEndOf(startBlock)) {
    change.insertNodeByKey(parent.key, index + 1, block, { normalize: normalize });
  } else {
    change.splitDescendantsByKey(startBlock.key, startKey, startOffset, OPTS);
    change.insertNodeByKey(parent.key, index + 1, block, { normalize: normalize });
  }

  if (normalize) {
    change.normalizeNodeByKey(parent.key, _core2.default);
  }
};

/**
 * Insert a `fragment` at a `range`.
 *
 * @param {Change} change
 * @param {Selection} range
 * @param {Document} fragment
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.insertFragmentAtRange = function (change, range, fragment) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize6 = options.normalize,
      normalize = _options$normalize6 === undefined ? true : _options$normalize6;

  // If the range is expanded, delete it first.

  if (range.isExpanded) {
    change.deleteAtRange(range, OPTS);
    range = range.collapseToStart();
  }

  // If the fragment is empty, there's nothing to do after deleting.
  if (!fragment.nodes.size) return;

  // Regenerate the keys for all of the fragments nodes, so that they're
  // guaranteed not to collide with the existing keys in the document. Otherwise
  // they will be rengerated automatically and we won't have an easy way to
  // reference them.
  fragment = fragment.mapDescendants(function (child) {
    return child.regenerateKey();
  });

  // Calculate a few things...
  var _range4 = range,
      startKey = _range4.startKey,
      startOffset = _range4.startOffset;
  var state = change.state;
  var _state2 = state,
      document = _state2.document;

  var startText = document.getDescendant(startKey);
  var startBlock = document.getClosestBlock(startText.key);
  var startChild = startBlock.getFurthestAncestor(startText.key);
  var isAtStart = range.isAtStartOf(startBlock);
  var parent = document.getParent(startBlock.key);
  var index = parent.nodes.indexOf(startBlock);
  var blocks = fragment.getBlocks();
  var firstBlock = blocks.first();
  var lastBlock = blocks.last();

  // If the fragment only contains a void block, use `insertBlock` instead.
  if (firstBlock == lastBlock && firstBlock.isVoid) {
    change.insertBlockAtRange(range, firstBlock, options);
    return;
  }

  // If the first and last block aren't the same, we need to insert all of the
  // nodes after the fragment's first block at the index.
  if (firstBlock != lastBlock) {
    var lonelyParent = fragment.getFurthest(firstBlock.key, function (p) {
      return p.nodes.size == 1;
    });
    var lonelyChild = lonelyParent || firstBlock;
    var startIndex = parent.nodes.indexOf(startBlock);
    fragment = fragment.removeDescendant(lonelyChild.key);

    fragment.nodes.forEach(function (node, i) {
      var newIndex = startIndex + i + 1;
      change.insertNodeByKey(parent.key, newIndex, node, OPTS);
    });
  }

  // Check if we need to split the node.
  if (startOffset != 0) {
    change.splitDescendantsByKey(startChild.key, startKey, startOffset, OPTS);
  }

  // Update our variables with the new state.
  state = change.state;
  document = state.document;
  startText = document.getDescendant(startKey);
  startBlock = document.getClosestBlock(startKey);
  startChild = startBlock.getFurthestAncestor(startText.key);

  // If the first and last block aren't the same, we need to move any of the
  // starting block's children after the split into the last block of the
  // fragment, which has already been inserted.
  if (firstBlock != lastBlock) {
    var nextChild = isAtStart ? startChild : startBlock.getNextSibling(startChild.key);
    var nextNodes = nextChild ? startBlock.nodes.skipUntil(function (n) {
      return n.key == nextChild.key;
    }) : (0, _immutable.List)();
    var lastIndex = lastBlock.nodes.size;

    nextNodes.forEach(function (node, i) {
      var newIndex = lastIndex + i;
      change.moveNodeByKey(node.key, lastBlock.key, newIndex, OPTS);
    });
  }

  // If the starting block is empty, we replace it entirely with the first block
  // of the fragment, since this leads to a more expected behavior for the user.
  if (startBlock.isEmpty) {
    change.removeNodeByKey(startBlock.key, OPTS);
    change.insertNodeByKey(parent.key, index, firstBlock, OPTS);
  }

  // Otherwise, we maintain the starting block, and insert all of the first
  // block's inline nodes into it at the split point.
  else {
      var inlineChild = startBlock.getFurthestAncestor(startText.key);
      var inlineIndex = startBlock.nodes.indexOf(inlineChild);

      firstBlock.nodes.forEach(function (inline, i) {
        var o = startOffset == 0 ? 0 : 1;
        var newIndex = inlineIndex + i + o;
        change.insertNodeByKey(startBlock.key, newIndex, inline, OPTS);
      });
    }

  // Normalize if requested.
  if (normalize) {
    change.normalizeNodeByKey(parent.key, _core2.default);
  }
};

/**
 * Insert an `inline` node at `range`.
 *
 * @param {Change} change
 * @param {Selection} range
 * @param {Inline|String|Object} inline
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.insertInlineAtRange = function (change, range, inline) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize7 = options.normalize,
      normalize = _options$normalize7 === undefined ? true : _options$normalize7;

  inline = _normalize2.default.inline(inline);

  if (range.isExpanded) {
    change.deleteAtRange(range, OPTS);
    range = range.collapseToStart();
  }

  var state = change.state;
  var document = state.document;
  var _range5 = range,
      startKey = _range5.startKey,
      startOffset = _range5.startOffset;

  var parent = document.getParent(startKey);
  var startText = document.assertDescendant(startKey);
  var index = parent.nodes.indexOf(startText);

  if (parent.isVoid) return;

  change.splitNodeByKey(startKey, startOffset, OPTS);
  change.insertNodeByKey(parent.key, index + 1, inline, OPTS);

  if (normalize) {
    change.normalizeNodeByKey(parent.key, _core2.default);
  }
};

/**
 * Insert `text` at a `range`, with optional `marks`.
 *
 * @param {Change} change
 * @param {Selection} range
 * @param {String} text
 * @param {Set<Mark>} marks (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.insertTextAtRange = function (change, range, text, marks) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var normalize = options.normalize;
  var state = change.state;
  var document = state.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var parent = document.getParent(startKey);

  if (parent.isVoid) return;

  if (range.isExpanded) {
    change.deleteAtRange(range, OPTS);
  }

  // PERF: Unless specified, don't normalize if only inserting text.
  if (normalize !== undefined) {
    normalize = range.isExpanded;
  }

  change.insertTextByKey(startKey, startOffset, text, marks, { normalize: normalize });
};

/**
 * Remove an existing `mark` to the characters at `range`.
 *
 * @param {Change} change
 * @param {Selection} range
 * @param {Mark|String} mark (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.removeMarkAtRange = function (change, range, mark) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  if (range.isCollapsed) return;

  var _options$normalize8 = options.normalize,
      normalize = _options$normalize8 === undefined ? true : _options$normalize8;
  var state = change.state;
  var document = state.document;

  var texts = document.getTextsAtRange(range);
  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;


  texts.forEach(function (node) {
    var key = node.key;

    var index = 0;
    var length = node.text.length;

    if (key == startKey) index = startOffset;
    if (key == endKey) length = endOffset;
    if (key == startKey && key == endKey) length = endOffset - startOffset;

    change.removeMarkByKey(key, index, length, mark, { normalize: normalize });
  });
};

/**
 * Set the `properties` of block nodes in a `range`.
 *
 * @param {Change} change
 * @param {Selection} range
 * @param {Object|String} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.setBlockAtRange = function (change, range, properties) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize9 = options.normalize,
      normalize = _options$normalize9 === undefined ? true : _options$normalize9;
  var state = change.state;
  var document = state.document;

  var blocks = document.getBlocksAtRange(range);

  blocks.forEach(function (block) {
    change.setNodeByKey(block.key, properties, { normalize: normalize });
  });
};

/**
 * Set the `properties` of inline nodes in a `range`.
 *
 * @param {Change} change
 * @param {Selection} range
 * @param {Object|String} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.setInlineAtRange = function (change, range, properties) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize10 = options.normalize,
      normalize = _options$normalize10 === undefined ? true : _options$normalize10;
  var state = change.state;
  var document = state.document;

  var inlines = document.getInlinesAtRange(range);

  inlines.forEach(function (inline) {
    change.setNodeByKey(inline.key, properties, { normalize: normalize });
  });
};

/**
 * Split the block nodes at a `range`, to optional `height`.
 *
 * @param {Change} change
 * @param {Selection} range
 * @param {Number} height (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.splitBlockAtRange = function (change, range) {
  var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize11 = options.normalize,
      normalize = _options$normalize11 === undefined ? true : _options$normalize11;


  if (range.isExpanded) {
    change.deleteAtRange(range, { normalize: normalize });
    range = range.collapseToStart();
  }

  var _range6 = range,
      startKey = _range6.startKey,
      startOffset = _range6.startOffset;
  var state = change.state;
  var document = state.document;

  var node = document.assertDescendant(startKey);
  var parent = document.getClosestBlock(node.key);
  var h = 0;

  while (parent && parent.kind == 'block' && h < height) {
    node = parent;
    parent = document.getClosestBlock(parent.key);
    h++;
  }

  change.splitDescendantsByKey(node.key, startKey, startOffset, { normalize: normalize });
};

/**
 * Split the inline nodes at a `range`, to optional `height`.
 *
 * @param {Change} change
 * @param {Selection} range
 * @param {Number} height (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.splitInlineAtRange = function (change, range) {
  var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Infinity;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize12 = options.normalize,
      normalize = _options$normalize12 === undefined ? true : _options$normalize12;


  if (range.isExpanded) {
    change.deleteAtRange(range, { normalize: normalize });
    range = range.collapseToStart();
  }

  var _range7 = range,
      startKey = _range7.startKey,
      startOffset = _range7.startOffset;
  var state = change.state;
  var document = state.document;

  var node = document.assertDescendant(startKey);
  var parent = document.getClosestInline(node.key);
  var h = 0;

  while (parent && parent.kind == 'inline' && h < height) {
    node = parent;
    parent = document.getClosestInline(parent.key);
    h++;
  }

  change.splitDescendantsByKey(node.key, startKey, startOffset, { normalize: normalize });
};

/**
 * Add or remove a `mark` from the characters at `range`, depending on whether
 * it's already there.
 *
 * @param {Change} change
 * @param {Selection} range
 * @param {Mixed} mark
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.toggleMarkAtRange = function (change, range, mark) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  if (range.isCollapsed) return;

  mark = _normalize2.default.mark(mark);

  var _options$normalize13 = options.normalize,
      normalize = _options$normalize13 === undefined ? true : _options$normalize13;
  var state = change.state;
  var document = state.document;

  var marks = document.getActiveMarksAtRange(range);
  var exists = marks.some(function (m) {
    return m.equals(mark);
  });

  if (exists) {
    change.removeMarkAtRange(range, mark, { normalize: normalize });
  } else {
    change.addMarkAtRange(range, mark, { normalize: normalize });
  }
};

/**
 * Unwrap all of the block nodes in a `range` from a block with `properties`.
 *
 * @param {Change} change
 * @param {Selection} range
 * @param {String|Object} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.unwrapBlockAtRange = function (change, range, properties) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  properties = _normalize2.default.nodeProperties(properties);

  var _options$normalize14 = options.normalize,
      normalize = _options$normalize14 === undefined ? true : _options$normalize14;
  var state = change.state;
  var _state3 = state,
      document = _state3.document;

  var blocks = document.getBlocksAtRange(range);
  var wrappers = blocks.map(function (block) {
    return document.getClosest(block.key, function (parent) {
      if (parent.kind != 'block') return false;
      if (properties.type != null && parent.type != properties.type) return false;
      if (properties.isVoid != null && parent.isVoid != properties.isVoid) return false;
      if (properties.data != null && !parent.data.isSuperset(properties.data)) return false;
      return true;
    });
  }).filter(function (exists) {
    return exists;
  }).toOrderedSet().toList();

  wrappers.forEach(function (block) {
    var first = block.nodes.first();
    var last = block.nodes.last();
    var parent = document.getParent(block.key);
    var index = parent.nodes.indexOf(block);

    var children = block.nodes.filter(function (child) {
      return blocks.some(function (b) {
        return child == b || child.hasDescendant(b.key);
      });
    });

    var firstMatch = children.first();
    var lastMatch = children.last();

    if (first == firstMatch && last == lastMatch) {
      block.nodes.forEach(function (child, i) {
        change.moveNodeByKey(child.key, parent.key, index + i, OPTS);
      });

      change.removeNodeByKey(block.key, OPTS);
    } else if (last == lastMatch) {
      block.nodes.skipUntil(function (n) {
        return n == firstMatch;
      }).forEach(function (child, i) {
        change.moveNodeByKey(child.key, parent.key, index + 1 + i, OPTS);
      });
    } else if (first == firstMatch) {
      block.nodes.takeUntil(function (n) {
        return n == lastMatch;
      }).push(lastMatch).forEach(function (child, i) {
        change.moveNodeByKey(child.key, parent.key, index + i, OPTS);
      });
    } else {
      var firstText = firstMatch.getFirstText();
      change.splitDescendantsByKey(block.key, firstText.key, 0, OPTS);
      state = change.state;
      document = state.document;

      children.forEach(function (child, i) {
        if (i == 0) {
          var extra = child;
          child = document.getNextBlock(child.key);
          change.removeNodeByKey(extra.key, OPTS);
        }

        change.moveNodeByKey(child.key, parent.key, index + 1 + i, OPTS);
      });
    }
  });

  // TODO: optmize to only normalize the right block
  if (normalize) {
    change.normalizeDocument(_core2.default);
  }
};

/**
 * Unwrap the inline nodes in a `range` from an inline with `properties`.
 *
 * @param {Change} change
 * @param {Selection} range
 * @param {String|Object} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.unwrapInlineAtRange = function (change, range, properties) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  properties = _normalize2.default.nodeProperties(properties);

  var _options$normalize15 = options.normalize,
      normalize = _options$normalize15 === undefined ? true : _options$normalize15;
  var state = change.state;
  var document = state.document;

  var texts = document.getTextsAtRange(range);
  var inlines = texts.map(function (text) {
    return document.getClosest(text.key, function (parent) {
      if (parent.kind != 'inline') return false;
      if (properties.type != null && parent.type != properties.type) return false;
      if (properties.isVoid != null && parent.isVoid != properties.isVoid) return false;
      if (properties.data != null && !parent.data.isSuperset(properties.data)) return false;
      return true;
    });
  }).filter(function (exists) {
    return exists;
  }).toOrderedSet().toList();

  inlines.forEach(function (inline) {
    var parent = change.state.document.getParent(inline.key);
    var index = parent.nodes.indexOf(inline);

    inline.nodes.forEach(function (child, i) {
      change.moveNodeByKey(child.key, parent.key, index + i, OPTS);
    });
  });

  // TODO: optmize to only normalize the right block
  if (normalize) {
    change.normalizeDocument(_core2.default);
  }
};

/**
 * Wrap all of the blocks in a `range` in a new `block`.
 *
 * @param {Change} change
 * @param {Selection} range
 * @param {Block|Object|String} block
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.wrapBlockAtRange = function (change, range, block) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  block = _normalize2.default.block(block);
  block = block.set('nodes', block.nodes.clear());

  var _options$normalize16 = options.normalize,
      normalize = _options$normalize16 === undefined ? true : _options$normalize16;
  var state = change.state;
  var document = state.document;


  var blocks = document.getBlocksAtRange(range);
  var firstblock = blocks.first();
  var lastblock = blocks.last();
  var parent = void 0,
      siblings = void 0,
      index = void 0;

  // If there is only one block in the selection then we know the parent and
  // siblings.
  if (blocks.length === 1) {
    parent = document.getParent(firstblock.key);
    siblings = blocks;
  }

  // Determine closest shared parent to all blocks in selection.
  else {
      parent = document.getClosest(firstblock.key, function (p1) {
        return !!document.getClosest(lastblock.key, function (p2) {
          return p1 == p2;
        });
      });
    }

  // If no shared parent could be found then the parent is the document.
  if (parent == null) parent = document;

  // Create a list of direct children siblings of parent that fall in the
  // selection.
  if (siblings == null) {
    var indexes = parent.nodes.reduce(function (ind, node, i) {
      if (node == firstblock || node.hasDescendant(firstblock.key)) ind[0] = i;
      if (node == lastblock || node.hasDescendant(lastblock.key)) ind[1] = i;
      return ind;
    }, []);

    index = indexes[0];
    siblings = parent.nodes.slice(indexes[0], indexes[1] + 1);
  }

  // Get the index to place the new wrapped node at.
  if (index == null) {
    index = parent.nodes.indexOf(siblings.first());
  }

  // Inject the new block node into the parent.
  change.insertNodeByKey(parent.key, index, block, OPTS);

  // Move the sibling nodes into the new block node.
  siblings.forEach(function (node, i) {
    change.moveNodeByKey(node.key, block.key, i, OPTS);
  });

  if (normalize) {
    change.normalizeNodeByKey(parent.key, _core2.default);
  }
};

/**
 * Wrap the text and inlines in a `range` in a new `inline`.
 *
 * @param {Change} change
 * @param {Selection} range
 * @param {Inline|Object|String} inline
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.wrapInlineAtRange = function (change, range, inline) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var state = change.state;
  var _state4 = state,
      document = _state4.document;
  var _options$normalize17 = options.normalize,
      normalize = _options$normalize17 === undefined ? true : _options$normalize17;
  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;


  if (range.isCollapsed) {
    // Wrapping an inline void
    var inlineParent = document.getClosestInline(startKey);
    if (!inlineParent.isVoid) {
      return;
    }

    return change.wrapInlineByKey(inlineParent.key, inline, options);
  }

  inline = _normalize2.default.inline(inline);
  inline = inline.set('nodes', inline.nodes.clear());

  var blocks = document.getBlocksAtRange(range);
  var startBlock = document.getClosestBlock(startKey);
  var endBlock = document.getClosestBlock(endKey);
  var startChild = startBlock.getFurthestAncestor(startKey);
  var endChild = endBlock.getFurthestAncestor(endKey);

  change.splitDescendantsByKey(endChild.key, endKey, endOffset, OPTS);
  change.splitDescendantsByKey(startChild.key, startKey, startOffset, OPTS);

  state = change.state;
  document = state.document;
  startBlock = document.getDescendant(startBlock.key);
  endBlock = document.getDescendant(endBlock.key);
  startChild = startBlock.getFurthestAncestor(startKey);
  endChild = endBlock.getFurthestAncestor(endKey);
  var startIndex = startBlock.nodes.indexOf(startChild);
  var endIndex = endBlock.nodes.indexOf(endChild);

  if (startBlock == endBlock) {
    state = change.state;
    document = state.document;
    startBlock = document.getClosestBlock(startKey);
    startChild = startBlock.getFurthestAncestor(startKey);

    var startInner = document.getNextSibling(startChild.key);
    var startInnerIndex = startBlock.nodes.indexOf(startInner);
    var endInner = startKey == endKey ? startInner : startBlock.getFurthestAncestor(endKey);
    var inlines = startBlock.nodes.skipUntil(function (n) {
      return n == startInner;
    }).takeUntil(function (n) {
      return n == endInner;
    }).push(endInner);

    var node = inline.regenerateKey();

    change.insertNodeByKey(startBlock.key, startInnerIndex, node, OPTS);

    inlines.forEach(function (child, i) {
      change.moveNodeByKey(child.key, node.key, i, OPTS);
    });

    if (normalize) {
      change.normalizeNodeByKey(startBlock.key, _core2.default);
    }
  } else {
    var startInlines = startBlock.nodes.slice(startIndex + 1);
    var endInlines = endBlock.nodes.slice(0, endIndex + 1);
    var startNode = inline.regenerateKey();
    var endNode = inline.regenerateKey();

    change.insertNodeByKey(startBlock.key, startIndex - 1, startNode, OPTS);
    change.insertNodeByKey(endBlock.key, endIndex, endNode, OPTS);

    startInlines.forEach(function (child, i) {
      change.moveNodeByKey(child.key, startNode.key, i, OPTS);
    });

    endInlines.forEach(function (child, i) {
      change.moveNodeByKey(child.key, endNode.key, i, OPTS);
    });

    if (normalize) {
      change.normalizeNodeByKey(startBlock.key, _core2.default).normalizeNodeByKey(endBlock.key, _core2.default);
    }

    blocks.slice(1, -1).forEach(function (block) {
      var node = inline.regenerateKey();
      change.insertNodeByKey(block.key, 0, node, OPTS);

      block.nodes.forEach(function (child, i) {
        change.moveNodeByKey(child.key, node.key, i, OPTS);
      });

      if (normalize) {
        change.normalizeNodeByKey(block.key, _core2.default);
      }
    });
  }
};

/**
 * Wrap the text in a `range` in a prefix/suffix.
 *
 * @param {Change} change
 * @param {Selection} range
 * @param {String} prefix
 * @param {String} suffix (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.wrapTextAtRange = function (change, range, prefix) {
  var suffix = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : prefix;
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var _options$normalize18 = options.normalize,
      normalize = _options$normalize18 === undefined ? true : _options$normalize18;
  var startKey = range.startKey,
      endKey = range.endKey;

  var start = range.collapseToStart();
  var end = range.collapseToEnd();

  if (startKey == endKey) {
    end = end.move(prefix.length);
  }

  change.insertTextAtRange(start, prefix, [], { normalize: normalize });
  change.insertTextAtRange(end, suffix, [], { normalize: normalize });
};

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Changes;