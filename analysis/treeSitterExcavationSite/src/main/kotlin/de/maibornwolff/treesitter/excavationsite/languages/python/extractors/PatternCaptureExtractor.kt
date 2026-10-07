package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children

/**
 * Extracts pattern capture variables from case_clause.
 * Recursively finds all captured identifiers in pattern matching.
 */
internal fun extractPatternCaptureVariables(node: SyntaxNode, findFirstIdentifier: (SyntaxNode) -> String?): List<String> {
    val patternNode = node.getChildByFieldName("pattern")

    return if (!patternNode.isNull) {
        extractCapturesFromNode(patternNode, findFirstIdentifier)
    } else {
        node
            .children()
            .takeWhile {
                it.type != ":" && it.type != "block"
            }.filter { it.type != "case" }
            .flatMap { extractCapturesFromNode(it, findFirstIdentifier) }
            .toList()
    }
}

private fun extractCapturesFromNode(node: SyntaxNode, findFirstIdentifier: (SyntaxNode) -> String?): List<String> = when (node.type) {
    "as_pattern" -> extractCapturesFromAsPattern(node, findFirstIdentifier)
    "keyword_pattern" -> extractCapturesFromKeywordPattern(node, findFirstIdentifier)
    "splat_pattern" -> listOfNotNull(findFirstIdentifier(node))
    "identifier" -> {
        val text = node.text
        if (text != "_" && !isClassNameInPattern(node)) {
            listOf(text)
        } else {
            emptyList()
        }
    }
    else -> node.children().flatMap { extractCapturesFromNode(it, findFirstIdentifier) }.toList()
}

private fun extractCapturesFromAsPattern(node: SyntaxNode, findFirstIdentifier: (SyntaxNode) -> String?): List<String> = node
    .children()
    .flatMap { child ->
        if (child.type == "identifier") {
            val text = child.text
            if (text != "_") listOf(text) else emptyList()
        } else {
            extractCapturesFromNode(child, findFirstIdentifier)
        }
    }.toList()

private fun extractCapturesFromKeywordPattern(node: SyntaxNode, findFirstIdentifier: (SyntaxNode) -> String?): List<String> {
    val valueNode = node.getChildByFieldName("value")
    return if (!valueNode.isNull) {
        extractCapturesFromNode(valueNode, findFirstIdentifier)
    } else {
        emptyList()
    }
}

/**
 * Checks if an identifier is the class name in a class_pattern (not a capture).
 * In `case Point(x, y):`, "Point" is the class name, "x" and "y" are captures.
 */
private fun isClassNameInPattern(node: SyntaxNode): Boolean {
    val parent = node.parent
    if (parent.isNull) return false
    return when (parent.type) {
        "class_pattern" -> {
            val classField = parent.getChildByFieldName("class")
            !classField.isNull &&
                (classField == node || TreeTraversal.isDescendantOf(node, classField))
        }
        "dotted_name" -> parent.parent.let { !it.isNull && it.type == "class_pattern" }
        else -> false
    }
}
