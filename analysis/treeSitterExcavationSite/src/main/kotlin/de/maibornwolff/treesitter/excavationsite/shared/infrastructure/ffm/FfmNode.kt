package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import java.lang.foreign.MemorySegment
import java.lang.foreign.ValueLayout.ADDRESS

/**
 * A node of an [FfmSyntaxTree]; valid only while that tree is open. Positions are fetched once and cached.
 *
 * @param knownParent the parent, when the node was reached from it: tree-sitter finds a parent by descending from
 * the root, which costs more with every sibling on the way and adds up for extractors that look at ancestors
 */
internal class FfmNode(val segment: MemorySegment, private val tree: FfmSyntaxTree, private val knownParent: FfmNode? = null) :
    SyntaxNode {
    private val id = segment.get(ADDRESS, TreeSitterApi.NODE_ID_OFFSET).address()
    private var start = UNREAD_POINT
    private var end = UNREAD_POINT

    override val type: String get() = tree.grammar.symbolName(TreeSitterApi.nodeSymbol(existingNode()))
    override val isNull: Boolean get() = id == NULL_ID
    override val childCount: Int get() = TreeSitterApi.nodeChildCount(existingNode())
    override val namedChildCount: Int get() = TreeSitterApi.nodeNamedChildCount(existingNode())
    override val startRow: Int get() = FfmSyntaxTree.row(startPoint())
    override val startColumn: Int get() = FfmSyntaxTree.column(startPoint())
    override val endRow: Int get() = FfmSyntaxTree.row(endPoint())
    override val endColumn: Int get() = FfmSyntaxTree.column(endPoint())
    override val startByte: Int get() = TreeSitterApi.nodeStartByte(existingNode())
    override val endByte: Int get() = TreeSitterApi.nodeEndByte(existingNode())
    override val text: String get() = tree.sourceText(startByte, endByte)
    override val parent: SyntaxNode
        get() {
            val node = existingNode()
            return knownParent ?: FfmNode(TreeSitterApi.nodeParent(tree.nodeAllocator, node), tree)
        }
    override val prevSibling: SyntaxNode
        get() = FfmNode(TreeSitterApi.nodePrevSibling(tree.nodeAllocator, existingNode()), tree, knownParent)

    override fun getChild(index: Int): SyntaxNode = FfmNode(TreeSitterApi.nodeChild(tree.nodeAllocator, existingNode(), index), tree, this)

    override fun getNamedChild(index: Int): SyntaxNode =
        FfmNode(TreeSitterApi.nodeNamedChild(tree.nodeAllocator, existingNode(), index), tree, this)

    override fun getChildByFieldName(name: String): SyntaxNode {
        val field = tree.fieldName(name)
        val nameLength = (field.byteSize() - 1).toInt()
        return FfmNode(TreeSitterApi.nodeChildByFieldName(tree.nodeAllocator, existingNode(), field, nameLength), tree, this)
    }

    override fun equals(other: Any?): Boolean = other is FfmNode && other.id == id && other.tree === tree

    override fun hashCode(): Int = id.hashCode()

    // tree-sitter dereferences a null node, which would crash the JVM instead of throwing
    private fun existingNode(): MemorySegment {
        check(!isNull) { "The node is a null node" }
        return segment
    }

    private fun startPoint(): Long {
        if (start == UNREAD_POINT) start = tree.packPoint(TreeSitterApi.nodeStartPoint(tree.pointAllocator, existingNode()))
        return start
    }

    private fun endPoint(): Long {
        if (end == UNREAD_POINT) end = tree.packPoint(TreeSitterApi.nodeEndPoint(tree.pointAllocator, existingNode()))
        return end
    }

    companion object {
        private const val UNREAD_POINT = -1L
        private const val NULL_ID = 0L
    }
}
