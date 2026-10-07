package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import java.lang.foreign.MemorySegment
import java.lang.foreign.ValueLayout.ADDRESS

/**
 * A node of an [FfmSyntaxTree]. Reached from [FfmSyntaxTree.rootNode] it is valid until the tree is closed; handed to
 * a visitor of [FfmSyntaxTree.walk] or reached inside one, only until that visitor returns. A node kept longer is not
 * detected: its memory is reused, so it reads as another node.
 *
 * Rows and columns are fetched once and cached; every other member asks tree-sitter on each access.
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

    override val type: String get() = tree.grammar.symbolName(TreeSitterApi.nodeSymbol(existingNode()))
    override val isNull: Boolean get() = subtreeAddress == NULL_ADDRESS
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
            val existingNode = existingNode()
            return rememberedParent ?: FfmNode(TreeSitterApi.nodeParent(tree.nodeAllocator, existingNode), tree)
        }

    // A missing token can be the previous sibling of a node and still hang below a deeper node, so it has to ask
    override val prevSibling: SyntaxNode get() = FfmNode(TreeSitterApi.nodePrevSibling(tree.nodeAllocator, existingNode()), tree)

    override fun getChild(index: Int): SyntaxNode = FfmNode(TreeSitterApi.nodeChild(tree.nodeAllocator, existingNode(), index), tree, this)

    override fun getNamedChild(index: Int): SyntaxNode =
        FfmNode(TreeSitterApi.nodeNamedChild(tree.nodeAllocator, existingNode(), index), tree, this)

    // A field can be inherited from a child that an alias made visible, so its node is not always a direct child
    override fun getChildByFieldName(name: String): SyntaxNode {
        val field = tree.fieldName(name)
        val nameLength = (field.byteSize() - 1).toInt()
        return FfmNode(TreeSitterApi.nodeChildByFieldName(tree.nodeAllocator, existingNode(), field, nameLength), tree)
    }

    override fun equals(other: Any?): Boolean = other is FfmNode && other.subtreeAddress == subtreeAddress && other.tree === tree

    override fun hashCode(): Int = subtreeAddress.hashCode()

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
        private const val NULL_ADDRESS = 0L
    }
}
