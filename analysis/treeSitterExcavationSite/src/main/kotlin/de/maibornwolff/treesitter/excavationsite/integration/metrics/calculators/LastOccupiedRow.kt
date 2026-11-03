package de.maibornwolff.treesitter.excavationsite.integration.metrics.calculators

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

// Some grammars (e.g. tree-sitter-rust doc comments, Ruby's __END__ data) include the trailing newline in the node,
// so its exclusive end point lands at column 0 of the next row. That row is not part of the node.
internal fun lastOccupiedRow(node: SyntaxNode, startRow: Int, endRow: Int): Int =
    if (node.endColumn == 0 && endRow > startRow) endRow - 1 else endRow
