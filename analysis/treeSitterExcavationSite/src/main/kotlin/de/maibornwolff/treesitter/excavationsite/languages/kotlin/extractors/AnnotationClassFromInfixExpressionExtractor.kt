package de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import org.treesitter.TSNode

private const val SIMPLE_IDENTIFIER = "simple_identifier"
private const val UNDERSCORE = "_"

/**
 * Extracts class name from annotation class parsed as infix_expression.
 *
 * Workaround for tree-sitter parsing issue: annotation classes with @annotations
 * are sometimes parsed as infix_expression with three simple_identifier children:
 * "annotation", "class", "<ClassName>".
 *
 * Returns null if underscore identifier.
 */
internal fun extractAnnotationClassFromInfixExpression(node: TSNode, sourceCode: String): String? {
    if (node.childCount != 3) return null

    val first = node.getChild(0)
    val second = node.getChild(1)
    val third = node.getChild(2)

    val allAreSimpleIdentifiers = first.type == SIMPLE_IDENTIFIER &&
        second.type == SIMPLE_IDENTIFIER &&
        third.type == SIMPLE_IDENTIFIER

    if (!allAreSimpleIdentifiers) return null

    val isAnnotationClassPattern = TreeTraversal.getNodeText(first, sourceCode) == "annotation" &&
        TreeTraversal.getNodeText(second, sourceCode) == "class"

    if (!isAnnotationClassPattern) return null

    val identifier = TreeTraversal.getNodeText(third, sourceCode)
    return identifier.takeIf { it != UNDERSCORE }
}
