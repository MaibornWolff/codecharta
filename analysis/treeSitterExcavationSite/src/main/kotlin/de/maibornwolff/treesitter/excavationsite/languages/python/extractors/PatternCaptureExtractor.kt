package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

/**
 * Extracts pattern capture variables from case_clause.
 * Recursively finds all captured identifiers in pattern matching.
 */
internal fun extractPatternCaptureVariables(
    node: TSNode,
    sourceCode: String,
    findFirstIdentifier: (TSNode, String) -> String?
): List<String> {
    val patternNode = node.getChildByFieldName("pattern")

    return if (patternNode != null && !patternNode.isNull) {
        extractCapturesFromNode(patternNode, sourceCode, findFirstIdentifier)
    } else {
        node
            .children()
            .takeWhile {
                it.type != ":" && it.type != "block"
            }.filter { it.type != "case" }
            .flatMap { extractCapturesFromNode(it, sourceCode, findFirstIdentifier) }
            .toList()
    }
}

private fun extractCapturesFromNode(node: TSNode, sourceCode: String, findFirstIdentifier: (TSNode, String) -> String?): List<String> =
    when (node.type) {
        "as_pattern" -> extractCapturesFromAsPattern(node, sourceCode, findFirstIdentifier)
        "keyword_pattern" -> extractCapturesFromKeywordPattern(node, sourceCode, findFirstIdentifier)
        "splat_pattern" -> listOfNotNull(findFirstIdentifier(node, sourceCode))
        "identifier" -> {
            val text = TreeTraversal.getNodeText(node, sourceCode)
            if (text != "_" && !isClassNameInPattern(node)) {
                listOf(text)
            } else {
                emptyList()
            }
        }
        else -> node.children().flatMap { extractCapturesFromNode(it, sourceCode, findFirstIdentifier) }.toList()
    }

private fun extractCapturesFromAsPattern(node: TSNode, sourceCode: String, findFirstIdentifier: (TSNode, String) -> String?): List<String> =
    node
        .children()
        .flatMap { child ->
            if (child.type == "identifier") {
                val text = TreeTraversal.getNodeText(child, sourceCode)
                if (text != "_") listOf(text) else emptyList()
            } else {
                extractCapturesFromNode(child, sourceCode, findFirstIdentifier)
            }
        }.toList()

private fun extractCapturesFromKeywordPattern(
    node: TSNode,
    sourceCode: String,
    findFirstIdentifier: (TSNode, String) -> String?
): List<String> {
    val valueNode = node.getChildByFieldName("value")
    return if (valueNode != null && !valueNode.isNull) {
        extractCapturesFromNode(valueNode, sourceCode, findFirstIdentifier)
    } else {
        emptyList()
    }
}

/**
 * Checks if an identifier is the class name in a class_pattern (not a capture).
 * In `case Point(x, y):`, "Point" is the class name, "x" and "y" are captures.
 */
private fun isClassNameInPattern(node: TSNode): Boolean {
    val parent = node.parent ?: return false
    return when (parent.type) {
        "class_pattern" -> {
            val classField = parent.getChildByFieldName("class")
            classField != null &&
                !classField.isNull &&
                (classField == node || TreeTraversal.isDescendantOf(node, classField))
        }
        "dotted_name" -> parent.parent?.type == "class_pattern"
        else -> false
    }
}
