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

    /** The source between two byte offsets, read from the UTF-8 bytes tree-sitter parsed. */
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
     * Visits all nodes depth-first in pre-order; iterative, so deeply nested code cannot overflow the stack. A visited
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
                visitAndReleaseWhatTheVisitorReached(node, visitor)
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

    private fun visitAndReleaseWhatTheVisitorReached(node: FfmNode, visitor: (node: FfmNode, nodeType: String) -> Unit) {
        val markBeforeVisit = nodeAllocator.mark()
        visitor(node, node.type)
        nodeAllocator.release(markBeforeVisit)
    }

    private fun gotoNextSiblingClosingFinishedAncestors(cursor: MemorySegment, openAncestors: ArrayList<OpenAncestor>): Boolean {
        while (!TreeSitterApi.cursorGotoNextSibling(cursor)) {
            if (!TreeSitterApi.cursorGotoParent(cursor)) return false
            nodeAllocator.release(openAncestors.removeLast().markBeforeNode)
        }
        return true
    }

    /**
     * The children of [parent] behind the first [skippedCount], or its named children behind that many named ones,
     * in one pass. They are all fetched before the first is handed out, so the one cursor of the tree is free again
     * when a caller descends into a child.
     */
    fun childrenBehind(skippedCount: Int, parent: FfmNode, onlyNamed: Boolean): List<FfmNode> {
        val cursor = childCursorAt(parent)
        val children = ArrayList<FfmNode>()
        var leftToSkip = skippedCount
        var hasChild = TreeSitterApi.cursorGotoFirstChild(cursor)
        while (hasChild) {
            val markBeforeChild = nodeAllocator.mark()
            val child = TreeSitterApi.cursorCurrentNode(nodeAllocator, cursor)
            val isAskedFor = !onlyNamed || TreeSitterApi.nodeIsNamed(child)
            if (isAskedFor && leftToSkip == 0) {
                children.add(FfmNode(child, this, parent))
            } else {
                nodeAllocator.release(markBeforeChild)
                if (isAskedFor) leftToSkip--
            }
            hasChild = TreeSitterApi.cursorGotoNextSibling(cursor)
        }
        return children
    }

    private fun childCursorAt(parent: FfmNode): MemorySegment {
        val parentSegment = parent.existingNode()
        val existingCursor = childCursor
        if (existingCursor == null) return TreeSitterApi.cursorNew(arena, parentSegment).also { childCursor = it }
        TreeSitterApi.cursorReset(existingCursor, parentSegment)
        return existingCursor
    }

    private class OpenAncestor(val node: FfmNode, val markBeforeNode: Long)

    /**
     * Hands the root to [read] and releases every node reached from it when [read] returns, for extraction that
     * traverses on its own instead of being visited by [walk]. The result must not hold a node.
     */
    fun <T> readReleasingReachedNodes(read: (root: FfmNode) -> T): T {
        val markBeforeRead = nodeAllocator.mark()
        try {
            return read(rootNode)
        } finally {
            nodeAllocator.release(markBeforeRead)
        }
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
