package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * The read-only view of a syntax tree node that metric calculation and extraction need, independent of the binding
 * that produced it. Positions are zero-based, like tree-sitter's points; byte offsets count the UTF-8 source.
 * Two nodes are equal when they are the same node of the same tree.
 *
 * A node may be valid only inside the extractor call that received it, so never keep one beyond that call, least of
 * all in a field: take its text or positions instead. A node kept longer is not detected and reads as another node. A missing parent, child or sibling is a null node, never null:
 * [isNull] is true and every other member throws; [orNull] turns it into null. Most members ask the parser on every
 * access, so hold a value in a local when it is needed twice.
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

    fun children(): Sequence<SyntaxNode>

    fun namedChildren(): Sequence<SyntaxNode>
}

fun SyntaxNode.orNull(): SyntaxNode? = takeUnless { it.isNull }

fun SyntaxNode.fieldOfType(fieldName: String, type: String): SyntaxNode? = getChildByFieldName(fieldName).orNull()?.takeIf {
    it.type == type
}
