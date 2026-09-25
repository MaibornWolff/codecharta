package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker

import org.treesitter.TSNode
import org.treesitter.TSTreeCursor

/**
 * Visitor function called for each node during tree traversal.
 *
 * @param node The current AST node
 * @param nodeType The type string of the node (cached for performance)
 */
typealias NodeVisitor = (node: TSNode, nodeType: String) -> Unit

/**
 * Generic AST tree walker using depth-first traversal.
 *
 * Uses [DeepRecursiveFunction] to avoid stack overflow on deeply nested code.
 * Both MetricCollector and TextExtractor use this shared walker.
 */
object TreeWalker {
    /**
     * Walks the AST starting from the cursor position, calling the visitor for each node.
     *
     * @param cursor The tree cursor positioned at the starting node
     * @param visitor Function called for each node visited
     */
    fun walk(cursor: TSTreeCursor, visitor: NodeVisitor) {
        walkTree(Pair(cursor, visitor))
    }

    private val walkTree = DeepRecursiveFunction<Pair<TSTreeCursor, NodeVisitor>, Unit> { (cursor, visitor) ->
        val node = cursor.currentNode()
        val nodeType = node.type

        visitor(node, nodeType)

        if (cursor.gotoFirstChild()) {
            do {
                callRecursive(Pair(cursor, visitor))
            } while (cursor.gotoNextSibling())
            cursor.gotoParent()
        }
    }
}
