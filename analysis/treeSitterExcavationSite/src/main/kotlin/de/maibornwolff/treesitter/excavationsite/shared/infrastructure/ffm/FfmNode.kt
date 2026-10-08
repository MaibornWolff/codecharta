package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import java.lang.foreign.MemorySegment
import java.lang.foreign.ValueLayout.ADDRESS

/**
 * A node of an [FfmSyntaxTree]. It lives until the innermost visit of [FfmSyntaxTree.walk] or read of
 * [FfmSyntaxTree.readReleasingReachedNodes] it was reached in returns; outside both, and the root itself, until the
 * tree is closed. A node kept longer is not detected: its memory is reused, so it reads as another node.
 *
 * @param rememberedParent the parent, where the way the node was reached makes it certain: tree-sitter finds a
 * parent by descending from the root, which costs more with every sibling on the way and adds up for extractors that
 * look at ancestors. Null means the parent has to be asked for, not that there is none
 */
internal class FfmNode(val segment: MemorySegment, private val tree: FfmSyntaxTree, private val rememberedParent: FfmNode? = null) :
    SyntaxNode {
    private val subtreeAddress = segment.get(ADDRESS, TreeSitterApi.NODE_ID_OFFSET).address()
    private var start = UNREAD_POINT
    private var end = UNREAD_POINT

    override val type: String get() = tree.grammar.symbolName(TreeSitterApi.nodeSymbol(segmentUnlessNull()))
    override val isNull: Boolean get() = subtreeAddress == NULL_ADDRESS
    override val childCount: Int get() = TreeSitterApi.nodeChildCount(segmentUnlessNull())
    override val namedChildCount: Int get() = TreeSitterApi.nodeNamedChildCount(segmentUnlessNull())
    override val startRow: Int get() = FfmSyntaxTree.row(startPoint())
    override val startColumn: Int get() = FfmSyntaxTree.column(startPoint())
    override val endRow: Int get() = FfmSyntaxTree.row(endPoint())
    override val endColumn: Int get() = FfmSyntaxTree.column(endPoint())
    override val startByte: Int get() = TreeSitterApi.nodeStartByte(segmentUnlessNull())
    override val endByte: Int get() = TreeSitterApi.nodeEndByte(segmentUnlessNull())
    override val text: String get() = tree.sourceText(startByte, endByte)
    override val parent: SyntaxNode
        get() {
            val segment = segmentUnlessNull()
            return rememberedParent ?: FfmNode(TreeSitterApi.nodeParent(tree.nodeAllocator, segment), tree)
        }

    // A missing token can be the previous sibling of a node and still hang below a deeper node, so the parent of a
    // sibling is not remembered
    override val prevSibling: SyntaxNode get() = FfmNode(TreeSitterApi.nodePrevSibling(tree.nodeAllocator, segmentUnlessNull()), tree)

    override fun getChild(index: Int): SyntaxNode =
        FfmNode(TreeSitterApi.nodeChild(tree.nodeAllocator, segmentUnlessNull(), index), tree, this)

    override fun getNamedChild(index: Int): SyntaxNode =
        FfmNode(TreeSitterApi.nodeNamedChild(tree.nodeAllocator, segmentUnlessNull(), index), tree, this)

    // A field can be inherited from a child that an alias made visible, so its node is not always a direct child
    // and this node is not remembered as its parent
    override fun getChildByFieldName(name: String): SyntaxNode {
        val field = tree.fieldName(name)
        val nameLength = (field.byteSize() - 1).toInt()
        return FfmNode(TreeSitterApi.nodeChildByFieldName(tree.nodeAllocator, segmentUnlessNull(), field, nameLength), tree)
    }

    // tree-sitter finds the child at an index by counting from the first one, which takes quadratic time for all
    // children of a long list; a cursor steps from child to child
    override fun children(): Sequence<SyntaxNode> = Sequence { tree.childrenOf(this, onlyNamed = false).iterator() }

    override fun namedChildren(): Sequence<SyntaxNode> = Sequence { tree.childrenOf(this, onlyNamed = true).iterator() }

    override fun equals(other: Any?): Boolean = other is FfmNode && other.subtreeAddress == subtreeAddress && other.tree === tree

    override fun hashCode(): Int = subtreeAddress.hashCode()

    // tree-sitter dereferences a null node, which would crash the JVM instead of throwing
    fun segmentUnlessNull(): MemorySegment {
        check(!isNull) { "The node is a null node" }
        return segment
    }

    private fun startPoint(): Long {
        if (start == UNREAD_POINT) start = tree.packPoint(TreeSitterApi.nodeStartPoint(tree.pointAllocator, segmentUnlessNull()))
        return start
    }

    private fun endPoint(): Long {
        if (end == UNREAD_POINT) end = tree.packPoint(TreeSitterApi.nodeEndPoint(tree.pointAllocator, segmentUnlessNull()))
        return end
    }

    companion object {
        private const val UNREAD_POINT = -1L
        private const val NULL_ADDRESS = 0L
    }
}
