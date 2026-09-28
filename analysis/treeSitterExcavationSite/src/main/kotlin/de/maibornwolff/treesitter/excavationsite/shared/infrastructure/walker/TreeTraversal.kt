package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker

import org.treesitter.TSNode

/**
 * Shared tree traversal utilities for text extraction.
 *
 * These utilities are used across all language-specific extraction implementations
 * and provide common patterns for navigating tree-sitter ASTs.
 */
object TreeTraversal {
    /**
     * Utility function to get the text of a node from the source code.
     *
     * Tree-sitter uses byte offsets, not character offsets, so we must
     * convert properly for multi-byte UTF-8 characters.
     */
    fun getNodeText(node: TSNode, sourceCode: String): String {
        val bytes = sourceCode.toByteArray(Charsets.UTF_8)
        val start = node.startByte
        val end = node.endByte
        return String(bytes, start, end - start, Charsets.UTF_8)
    }

    /**
     * Finds the first child of the given types and returns its text.
     */
    fun findFirstChildTextByType(node: TSNode, sourceCode: String, vararg types: String): String? =
        node.children().firstOrNull { it.type in types }?.let { getNodeText(it, sourceCode) }

    /**
     * Finds all children of the given types and returns their text.
     */
    fun findAllChildrenTextByType(node: TSNode, sourceCode: String, vararg types: String): List<String> = node
        .children()
        .filter { it.type in types }
        .map { getNodeText(it, sourceCode) }
        .toList()

    /**
     * Finds the last child of the given types and returns its text.
     */
    fun findLastChildTextByType(node: TSNode, sourceCode: String, vararg types: String): String? =
        node.children().lastOrNull { it.type in types }?.let { getNodeText(it, sourceCode) }

    /**
     * Finds a single child by type and returns its text.
     */
    fun findChildByType(node: TSNode, childType: String, sourceCode: String): String? =
        node.children().firstOrNull { it.type == childType }?.let { getNodeText(it, sourceCode) }

    /**
     * Checks if the node has an ancestor of the given type.
     */
    fun hasAncestorOfType(node: TSNode, type: String): Boolean {
        var current = node.parent
        while (current != null && !current.isNull) {
            if (current.type == type) return true
            current = current.parent
        }
        return false
    }

    /**
     * Checks if the node has an ancestor of any of the given types.
     */
    fun hasAncestorOfTypes(node: TSNode, vararg types: String): Boolean {
        val typeSet = types.toSet()
        var current = node.parent
        while (current != null && !current.isNull) {
            if (current.type in typeSet) return true
            current = current.parent
        }
        return false
    }

    /**
     * Finds the first ancestor of the given type, or null if none exists.
     */
    fun findAncestorOfType(node: TSNode, type: String): TSNode? {
        var current = node.parent
        while (current != null && !current.isNull) {
            if (current.type == type) return current
            current = current.parent
        }
        return null
    }

    /**
     * Checks if the node is a descendant of the given ancestor node.
     */
    fun isDescendantOf(node: TSNode, ancestor: TSNode): Boolean {
        var current = node.parent
        while (current != null && !current.isNull) {
            if (current == ancestor) return true
            current = current.parent
        }
        return false
    }

    /**
     * Finds all descendants matching any of the given types via recursive descent.
     */
    fun findAllDescendantsOfType(node: TSNode, vararg types: String): List<TSNode> {
        val typeSet = types.toSet()
        val result = mutableListOf<TSNode>()
        collectDescendantsOfType(node, typeSet, result)
        return result
    }

    private fun collectDescendantsOfType(node: TSNode, types: Set<String>, result: MutableList<TSNode>) {
        for (child in node.children()) {
            if (child.isNull) continue
            if (child.type in types) result.add(child)
            collectDescendantsOfType(child, types, result)
        }
    }

    /**
     * Finds all descendants matching any of the given types in a single pass,
     * returning them bucketed by node type.
     */
    fun findAllDescendantsGroupedByType(node: TSNode, types: Set<String>): Map<String, List<TSNode>> {
        val result = mutableMapOf<String, MutableList<TSNode>>()
        collectDescendantsByTypes(node, types, result)
        return result
    }

    private fun collectDescendantsByTypes(node: TSNode, types: Set<String>, result: MutableMap<String, MutableList<TSNode>>) {
        for (child in node.children()) {
            if (child.isNull) continue
            if (child.type in types) {
                result.getOrPut(child.type) { mutableListOf() }.add(child)
            }
            collectDescendantsByTypes(child, types, result)
        }
    }

    /**
     * Recursively checks if any descendant has the given type.
     */
    fun containsNodeOfType(node: TSNode, type: String): Boolean {
        for (child in node.children()) {
            if (child.isNull) continue
            if (child.type == type) return true
            if (containsNodeOfType(child, type)) return true
        }
        return false
    }
}

/**
 * Extension function to iterate over all children of a TSNode.
 */
fun TSNode.children(): Sequence<TSNode> = sequence {
    for (i in 0 until childCount) {
        yield(getChild(i))
    }
}

/**
 * Extension function to iterate over all named children of a TSNode.
 */
fun TSNode.namedChildren(): Sequence<TSNode> = sequence {
    for (i in 0 until namedChildCount) {
        yield(getNamedChild(i))
    }
}
