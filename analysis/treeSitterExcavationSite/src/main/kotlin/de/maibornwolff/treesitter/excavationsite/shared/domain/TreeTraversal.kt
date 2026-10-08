package de.maibornwolff.treesitter.excavationsite.shared.domain

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

    fun findAllDescendantsOfType(node: SyntaxNode, vararg types: String): List<SyntaxNode> {
        val typeSet = types.toSet()
        return descendantsInPreOrder(node).filter { it.type in typeSet }.toList()
    }

    fun findAllDescendantsGroupedByType(node: SyntaxNode, types: Set<String>): Map<String, List<SyntaxNode>> =
        descendantsInPreOrder(node).filter { it.type in types }.groupBy { it.type }

    fun containsNodeOfType(node: SyntaxNode, type: String): Boolean = descendantsInPreOrder(node).any { it.type == type }

    // Iterative: a recursive descent overflows the stack on deeply nested code, such as a long chain of concatenations
    private fun descendantsInPreOrder(node: SyntaxNode): Sequence<SyntaxNode> = sequence {
        val openSiblingLists = ArrayDeque<Iterator<SyntaxNode>>()
        openSiblingLists.addLast(node.children().iterator())
        while (openSiblingLists.isNotEmpty()) {
            val siblings = openSiblingLists.last()
            if (siblings.hasNext()) {
                val descendant = siblings.next()
                yield(descendant)
                openSiblingLists.addLast(descendant.children().iterator())
            } else {
                openSiblingLists.removeLast()
            }
        }
    }
}

fun SyntaxNode.ancestors(): Sequence<SyntaxNode> = generateSequence(parent.orNull()) { it.parent.orNull() }
