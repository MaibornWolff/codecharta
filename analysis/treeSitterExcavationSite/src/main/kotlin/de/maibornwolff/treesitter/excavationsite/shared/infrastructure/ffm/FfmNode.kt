package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import java.lang.foreign.MemorySegment
import java.lang.foreign.ValueLayout.ADDRESS

/** A node of an [FfmSyntaxTree]; valid only while that tree is open. Positions are fetched once and cached. */
internal class FfmNode(val segment: MemorySegment, private val tree: FfmSyntaxTree) : SyntaxNode {
    private var start = UNREAD_POINT
    private var end = UNREAD_POINT

    override val type: String get() = tree.grammar.symbolName(TreeSitterApi.nodeSymbol(segment))
    override val isNull: Boolean get() = segment.get(ADDRESS, TreeSitterApi.NODE_ID_OFFSET) == MemorySegment.NULL
    override val childCount: Int get() = TreeSitterApi.nodeChildCount(segment)
    override val startRow: Int get() = FfmSyntaxTree.row(startPoint())
    override val startColumn: Int get() = FfmSyntaxTree.column(startPoint())
    override val endRow: Int get() = FfmSyntaxTree.row(endPoint())
    override val endColumn: Int get() = FfmSyntaxTree.column(endPoint())
    override val parent: SyntaxNode get() = FfmNode(TreeSitterApi.nodeParent(tree.nodeAllocator, segment), tree)

    override fun getChild(index: Int): SyntaxNode = FfmNode(TreeSitterApi.nodeChild(tree.nodeAllocator, segment, index), tree)

    override fun getChildByFieldName(name: String): SyntaxNode {
        val field = tree.fieldName(name)
        val nameLength = (field.byteSize() - 1).toInt()
        return FfmNode(TreeSitterApi.nodeChildByFieldName(tree.nodeAllocator, segment, field, nameLength), tree)
    }

    private fun startPoint(): Long {
        if (start == UNREAD_POINT) start = tree.packPoint(TreeSitterApi.nodeStartPoint(tree.pointAllocator, segment))
        return start
    }

    private fun endPoint(): Long {
        if (end == UNREAD_POINT) end = tree.packPoint(TreeSitterApi.nodeEndPoint(tree.pointAllocator, segment))
        return end
    }

    companion object {
        private const val UNREAD_POINT = -1L
    }
}
