package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * Tree navigation shared by text and dependency extraction.
 */
object TreeTraversal {
    fun findFirstChildTextByType(node: SyntaxNode, vararg types: String): String? = node.children().firstOrNull { it.type in types }?.text

    fun findAllChildrenTextByType(node: SyntaxNode, vararg types: String): List<String> = node
        .children()
        .filter { it.type in types }
        .map { it.text }
        .toList()

    fun hasAncestorOfType(node: SyntaxNode, type: String): Boolean = node.ancestors().any { it.type == type }

    fun hasAncestorOfTypes(node: SyntaxNode, vararg types: String): Boolean {
        val typeSet = types.toSet()
        return node.ancestors().any { it.type in typeSet }
    }

    fun findAncestorOfType(node: SyntaxNode, type: String): SyntaxNode? = node.ancestors().firstOrNull { it.type == type }

    fun isDescendantOf(node: SyntaxNode, ancestor: SyntaxNode): Boolean = node.ancestors().any { it == ancestor }

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

/**
 * The parent, its parent and so on up to the root.
 */
fun SyntaxNode.ancestors(): Sequence<SyntaxNode> = generateSequence(parent.orNull()) { it.parent.orNull() }
