package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * Shared tree traversal utilities for text extraction.
 *
 * These utilities are used across all language-specific extraction implementations
 * and provide common patterns for navigating tree-sitter ASTs.
 */
object TreeTraversal {
    /**
     * Finds the first child of the given types and returns its text.
     */
    fun findFirstChildTextByType(node: SyntaxNode, vararg types: String): String? =
        node.children().firstOrNull { it.type in types }?.let { it.text }

    /**
     * Finds all children of the given types and returns their text.
     */
    fun findAllChildrenTextByType(node: SyntaxNode, vararg types: String): List<String> = node
        .children()
        .filter { it.type in types }
        .map { it.text }
        .toList()

    /**
     * Finds the last child of the given types and returns its text.
     */
    fun findLastChildTextByType(node: SyntaxNode, vararg types: String): String? =
        node.children().lastOrNull { it.type in types }?.let { it.text }

    /**
     * Finds a single child by type and returns its text.
     */
    fun findChildByType(node: SyntaxNode, childType: String): String? =
        node.children().firstOrNull { it.type == childType }?.let { it.text }

    /**
     * Checks if the node has an ancestor of the given type.
     */
    fun hasAncestorOfType(node: SyntaxNode, type: String): Boolean {
        var current = node.parent
        while (!current.isNull) {
            if (current.type == type) return true
            current = current.parent
        }
        return false
    }

    /**
     * Checks if the node has an ancestor of any of the given types.
     */
    fun hasAncestorOfTypes(node: SyntaxNode, vararg types: String): Boolean {
        val typeSet = types.toSet()
        var current = node.parent
        while (!current.isNull) {
            if (current.type in typeSet) return true
            current = current.parent
        }
        return false
    }

    /**
     * Finds the first ancestor of the given type, or null if none exists.
     */
    fun findAncestorOfType(node: SyntaxNode, type: String): SyntaxNode? {
        var current = node.parent
        while (!current.isNull) {
            if (current.type == type) return current
            current = current.parent
        }
        return null
    }

    /**
     * Checks if the node is a descendant of the given ancestor node.
     */
    fun isDescendantOf(node: SyntaxNode, ancestor: SyntaxNode): Boolean {
        var current = node.parent
        while (!current.isNull) {
            if (current == ancestor) return true
            current = current.parent
        }
        return false
    }

    /**
     * Finds all descendants matching any of the given types via recursive descent.
     */
    fun findAllDescendantsOfType(node: SyntaxNode, vararg types: String): List<SyntaxNode> {
        val typeSet = types.toSet()
        val result = mutableListOf<SyntaxNode>()
        collectDescendantsOfType(node, typeSet, result)
        return result
    }

    private fun collectDescendantsOfType(node: SyntaxNode, types: Set<String>, result: MutableList<SyntaxNode>) {
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
    fun findAllDescendantsGroupedByType(node: SyntaxNode, types: Set<String>): Map<String, List<SyntaxNode>> {
        val result = mutableMapOf<String, MutableList<SyntaxNode>>()
        collectDescendantsByTypes(node, types, result)
        return result
    }

    private fun collectDescendantsByTypes(node: SyntaxNode, types: Set<String>, result: MutableMap<String, MutableList<SyntaxNode>>) {
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
    fun containsNodeOfType(node: SyntaxNode, type: String): Boolean {
        for (child in node.children()) {
            if (child.isNull) continue
            if (child.type == type) return true
            if (containsNodeOfType(child, type)) return true
        }
        return false
    }
}

/**
 * Extension function to iterate over all children of a SyntaxNode.
 */
fun SyntaxNode.children(): Sequence<SyntaxNode> = sequence {
    for (i in 0 until childCount) {
        yield(getChild(i))
    }
}

/**
 * Extension function to iterate over all named children of a SyntaxNode.
 */
fun SyntaxNode.namedChildren(): Sequence<SyntaxNode> = sequence {
    for (i in 0 until namedChildCount) {
        yield(getNamedChild(i))
    }
}
