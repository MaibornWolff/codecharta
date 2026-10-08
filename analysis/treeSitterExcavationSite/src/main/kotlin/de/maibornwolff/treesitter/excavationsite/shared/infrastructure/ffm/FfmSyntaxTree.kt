package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import java.lang.foreign.Arena
import java.lang.foreign.MemorySegment
import java.lang.foreign.SegmentAllocator
import java.lang.foreign.ValueLayout.JAVA_BYTE
import java.lang.foreign.ValueLayout.JAVA_INT

/**
 * A parsed file and the source it was parsed from. The source and all nodes live in one confined arena that [close]
 * frees together with the tree, so a tree and its nodes must stay on the thread that parsed them and must not be
 * used after [close].
 */
internal class FfmSyntaxTree private constructor(
    private val arena: Arena,
    private val tree: MemorySegment,
    private val source: MemorySegment,
    val grammar: FfmGrammar
) : AutoCloseable {
    val nodeAllocator = BlockAllocator(arena)
    private val pointBuffer = arena.allocate(TreeSitterApi.POINT)
    val pointAllocator = SegmentAllocator { _, _ -> pointBuffer }
    private val fieldNames = HashMap<String, MemorySegment>()
    private var childCursor: MemorySegment? = null

    val rootNode = FfmNode(TreeSitterApi.treeRootNode(nodeAllocator, tree), this)

    fun fieldName(name: String): MemorySegment = fieldNames.getOrPut(name) { arena.allocateFrom(name) }

    fun sourceText(startByte: Int, endByte: Int): String {
        val bytes = source.asSlice(startByte.toLong(), (endByte - startByte).toLong()).toArray(JAVA_BYTE)
        return String(bytes, Charsets.UTF_8)
    }

    /** Packs a `TSPoint` into one long, so a node caches a position without holding on to the reused point buffer. */
    fun packPoint(point: MemorySegment): Long {
        val row = point.get(JAVA_INT, TreeSitterApi.POINT_ROW_OFFSET).toLong()
        val column = point.get(JAVA_INT, TreeSitterApi.POINT_COLUMN_OFFSET).toLong()
        return (row shl Int.SIZE_BITS) or (column and UNSIGNED_INT_MASK)
    }

    /**
     * Pre-order and iterative, so deeply nested code cannot overflow the stack. A visited
     * node and every node reached from it are valid only during that visit. Only the ancestors of the visited node
     * are kept, as its remembered parents, so the memory of a walk grows with the depth of the tree and not with its
     * size.
     */
    fun walk(visitor: (node: FfmNode, nodeType: String) -> Unit) {
        val cursor = TreeSitterApi.cursorNew(arena, rootNode.segment)
        val openAncestors = ArrayList<OpenAncestor>()
        try {
            var hasNode = true
            while (hasNode) {
                val markBeforeNode = nodeAllocator.mark()
                val node = FfmNode(TreeSitterApi.cursorCurrentNode(nodeAllocator, cursor), this, openAncestors.lastOrNull()?.node)
                releasingReachedNodes { visitor(node, node.type) }
                if (TreeSitterApi.cursorGotoFirstChild(cursor)) {
                    openAncestors.add(OpenAncestor(node, markBeforeNode))
                } else {
                    nodeAllocator.release(markBeforeNode)
                    hasNode = gotoNextSiblingClosingFinishedAncestors(cursor, openAncestors)
                }
            }
        } finally {
            TreeSitterApi.cursorDelete(cursor)
        }
    }

    private fun gotoNextSiblingClosingFinishedAncestors(cursor: MemorySegment, openAncestors: ArrayList<OpenAncestor>): Boolean {
        while (!TreeSitterApi.cursorGotoNextSibling(cursor)) {
            if (!TreeSitterApi.cursorGotoParent(cursor)) return false
            nodeAllocator.release(openAncestors.removeLast().markBeforeNode)
        }
        return true
    }

    private class OpenAncestor(val node: FfmNode, val markBeforeNode: Long)

    /**
     * For extraction that traverses on its own instead of being visited by [walk]. What [read] returns must not hold
     * a node.
     */
    fun <T> readReleasingReachedNodes(read: (root: FfmNode) -> T): T = releasingReachedNodes { read(rootNode) }

    private inline fun <T> releasingReachedNodes(reach: () -> T): T {
        val markBeforeReaching = nodeAllocator.mark()
        try {
            return reach()
        } finally {
            nodeAllocator.release(markBeforeReaching)
        }
    }

    /**
     * All children are fetched before the first is handed out, so the one cursor of the tree is free again when a
     * caller descends into a child.
     */
    fun childrenOf(parent: FfmNode, onlyNamed: Boolean): List<FfmNode> {
        val cursor = childCursorResetTo(parent)
        val children = ArrayList<FfmNode>()
        var hasChild = TreeSitterApi.cursorGotoFirstChild(cursor)
        while (hasChild) {
            val markBeforeChild = nodeAllocator.mark()
            val child = TreeSitterApi.cursorCurrentNode(nodeAllocator, cursor)
            if (onlyNamed && !TreeSitterApi.nodeIsNamed(child)) {
                nodeAllocator.release(markBeforeChild)
            } else {
                children.add(FfmNode(child, this, parent))
            }
            hasChild = TreeSitterApi.cursorGotoNextSibling(cursor)
        }
        return children
    }

    private fun childCursorResetTo(parent: FfmNode): MemorySegment {
        val parentSegment = parent.segmentUnlessNull()
        val existingCursor = childCursor
        if (existingCursor == null) return TreeSitterApi.cursorNew(arena, parentSegment).also { childCursor = it }
        TreeSitterApi.cursorReset(existingCursor, parentSegment)
        return existingCursor
    }

    override fun close() {
        if (!arena.scope().isAlive) return
        childCursor?.let { TreeSitterApi.cursorDelete(it) }
        arena.close()
        TreeSitterApi.treeDelete(tree)
    }

    companion object {
        private const val UNSIGNED_INT_MASK = 0xFFFFFFFFL

        fun row(packedPoint: Long): Int = (packedPoint ushr Int.SIZE_BITS).toInt()

        fun column(packedPoint: Long): Int = packedPoint.toInt()

        fun parse(content: String, grammar: FfmGrammar): FfmSyntaxTree {
            val arena = Arena.ofConfined()
            try {
                val nullTerminatedSource = arena.allocateFrom(content)
                return FfmSyntaxTree(arena, parse(nullTerminatedSource, grammar), nullTerminatedSource, grammar)
            } catch (failure: Throwable) {
                arena.close()
                throw failure
            }
        }

        private fun parse(nullTerminatedSource: MemorySegment, grammar: FfmGrammar): MemorySegment {
            val parser = TreeSitterApi.parserNew()
            try {
                check(
                    TreeSitterApi.parserSetLanguage(parser, grammar.language)
                ) { "The grammar is incompatible with the tree-sitter core library" }
                val sourceLength = (nullTerminatedSource.byteSize() - 1).toInt()
                val tree = TreeSitterApi.parserParseString(parser, nullTerminatedSource, sourceLength)
                check(tree != MemorySegment.NULL) { "tree-sitter could not parse the source" }
                return tree
            } finally {
                TreeSitterApi.parserDelete(parser)
            }
        }
    }
}
