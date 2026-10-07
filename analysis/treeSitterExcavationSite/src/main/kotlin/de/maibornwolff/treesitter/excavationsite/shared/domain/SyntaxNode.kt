package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * The read-only view of a syntax tree node that metric calculation needs, independent of the binding
 * that produced it. Positions are zero-based, like tree-sitter's points.
 */
interface SyntaxNode {
    val type: String
    val isNull: Boolean
    val childCount: Int
    val startRow: Int
    val startColumn: Int
    val endRow: Int
    val endColumn: Int
    val parent: SyntaxNode

    fun getChild(index: Int): SyntaxNode

    fun getChildByFieldName(name: String): SyntaxNode
}
