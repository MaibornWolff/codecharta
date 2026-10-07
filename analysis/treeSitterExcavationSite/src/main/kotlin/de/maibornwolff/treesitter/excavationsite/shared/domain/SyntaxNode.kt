package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * The read-only view of a syntax tree node that metric calculation and extraction need, independent of the binding
 * that produced it. Positions are zero-based, like tree-sitter's points; byte offsets count the UTF-8 source.
 * Two nodes are equal when they are the same node of the same tree.
 */
interface SyntaxNode {
    val type: String
    val isNull: Boolean
    val childCount: Int
    val namedChildCount: Int
    val startRow: Int
    val startColumn: Int
    val endRow: Int
    val endColumn: Int
    val startByte: Int
    val endByte: Int
    val text: String
    val parent: SyntaxNode
    val prevSibling: SyntaxNode

    fun getChild(index: Int): SyntaxNode

    fun getNamedChild(index: Int): SyntaxNode

    fun getChildByFieldName(name: String): SyntaxNode
}
