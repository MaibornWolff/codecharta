package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import java.lang.foreign.Arena
import java.lang.foreign.MemorySegment
import java.lang.foreign.SegmentAllocator
import java.lang.foreign.ValueLayout.JAVA_INT

/**
 * A parsed file. All native memory of the tree and its nodes lives in one confined arena that [close] frees, so a
 * tree and its nodes must stay on the thread that parsed them and must not be used after [close].
 */
internal class FfmSyntaxTree private constructor(private val arena: Arena, private val tree: MemorySegment, val grammar: FfmGrammar) :
    AutoCloseable {
        val nodeAllocator = BlockAllocator(arena)
        private val pointBuffer = arena.allocate(TreeSitterApi.POINT)
        val pointAllocator = SegmentAllocator { _, _ -> pointBuffer }
        private val fieldNames = HashMap<String, MemorySegment>()

        val rootNode = FfmNode(TreeSitterApi.treeRootNode(nodeAllocator, tree), this)

        fun fieldName(name: String): MemorySegment = fieldNames.getOrPut(name) { arena.allocateFrom(name) }

        /** Packs a `TSPoint` into one long, so a node caches a position without holding on to the reused point buffer. */
        fun packPoint(point: MemorySegment): Long {
            val row = point.get(JAVA_INT, TreeSitterApi.POINT_ROW_OFFSET).toLong()
            val column = point.get(JAVA_INT, TreeSitterApi.POINT_COLUMN_OFFSET).toLong()
            return (row shl Int.SIZE_BITS) or (column and UNSIGNED_INT_MASK)
        }

        /**
         * Visits all nodes depth-first in pre-order; iterative, so deeply nested code cannot overflow the stack. A visited
         * node and every node reached from it are valid only during that visit, which keeps the memory of a walk constant.
         */
        fun walk(visitor: (FfmNode, String) -> Unit) {
            val cursor = TreeSitterApi.cursorNew(arena, rootNode.segment)
            try {
                var hasNode = true
                while (hasNode) {
                    val nodesBeforeVisit = nodeAllocator.mark()
                    val node = FfmNode(TreeSitterApi.cursorCurrentNode(nodeAllocator, cursor), this)
                    visitor(node, node.type)
                    nodeAllocator.release(nodesBeforeVisit)
                    hasNode = TreeSitterApi.cursorGotoFirstChild(cursor) || gotoNextInPreOrder(cursor)
                }
            } finally {
                TreeSitterApi.cursorDelete(cursor)
            }
        }

        private fun gotoNextInPreOrder(cursor: MemorySegment): Boolean {
            while (!TreeSitterApi.cursorGotoNextSibling(cursor)) {
                if (!TreeSitterApi.cursorGotoParent(cursor)) return false
            }
            return true
        }

        override fun close() {
            if (!arena.scope().isAlive) return
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
                    return FfmSyntaxTree(arena, parse(arena.allocateFrom(content), grammar), grammar)
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
