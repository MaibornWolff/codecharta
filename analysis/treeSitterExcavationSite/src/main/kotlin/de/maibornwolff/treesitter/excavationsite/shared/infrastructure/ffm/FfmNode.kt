package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import java.lang.foreign.MemorySegment
import java.lang.foreign.ValueLayout.ADDRESS

/** A node of an [FfmSyntaxTree]; valid only while that tree is open. Positions are fetched once and cached. */
internal class FfmNode(val segment: MemorySegment, private val tree: FfmSyntaxTree) : SyntaxNode {
    private var start = UNREAD_POINT
    private var end = UNREAD_POINT

    override val type: String get() = tree.grammar.symbolName(TreeSitterApi.nodeSymbol(existingNode()))
    override val isNull: Boolean get() = segment.get(ADDRESS, TreeSitterApi.NODE_ID_OFFSET) == MemorySegment.NULL
    override val childCount: Int get() = TreeSitterApi.nodeChildCount(existingNode())
    override val startRow: Int get() = FfmSyntaxTree.row(startPoint())
    override val startColumn: Int get() = FfmSyntaxTree.column(startPoint())
    override val endRow: Int get() = FfmSyntaxTree.row(endPoint())
    override val endColumn: Int get() = FfmSyntaxTree.column(endPoint())
    override val parent: SyntaxNode get() = FfmNode(TreeSitterApi.nodeParent(tree.nodeAllocator, existingNode()), tree)

    override fun getChild(index: Int): SyntaxNode = FfmNode(TreeSitterApi.nodeChild(tree.nodeAllocator, existingNode(), index), tree)

    override fun getChildByFieldName(name: String): SyntaxNode {
        val field = tree.fieldName(name)
        val nameLength = (field.byteSize() - 1).toInt()
        return FfmNode(TreeSitterApi.nodeChildByFieldName(tree.nodeAllocator, existingNode(), field, nameLength), tree)
    }

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
    }
}
