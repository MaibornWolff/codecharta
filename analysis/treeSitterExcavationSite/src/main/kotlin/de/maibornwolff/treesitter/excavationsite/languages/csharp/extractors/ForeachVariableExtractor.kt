package de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"
private const val IN_KEYWORD = "in"

private const val IMPLICIT_TYPE = "implicit_type"
private const val PREDEFINED_TYPE = "predefined_type"
private const val NULLABLE_TYPE = "nullable_type"
private const val GENERIC_NAME = "generic_name"
private const val QUALIFIED_NAME = "qualified_name"
private const val ARRAY_TYPE = "array_type"

private val typeNodes = setOf(
    IMPLICIT_TYPE,
    PREDEFINED_TYPE,
    NULLABLE_TYPE,
    GENERIC_NAME,
    QUALIFIED_NAME,
    ARRAY_TYPE
)

/**
 * Extracts variable from foreach statement: `foreach (var item in collection)`
 *
 * Finds the identifier after the type and before the "in" keyword.
 */
internal fun extractForeachVariable(node: TSNode, sourceCode: String): String? {
    val childrenBeforeIn = node
        .children()
        .takeWhile { it.type != IN_KEYWORD }
        .toList()
    return findVariableAfterType(childrenBeforeIn, sourceCode)
}

private fun findVariableAfterType(children: List<TSNode>, sourceCode: String): String? {
    val indexOfType = children.indexOfFirst { isTypeNode(it) }
    if (indexOfType < 0) return null

    return children
        .drop(indexOfType + 1)
        .firstOrNull { it.type == IDENTIFIER }
        ?.let { TreeTraversal.getNodeText(it, sourceCode) }
}

private fun isTypeNode(node: TSNode): Boolean = node.type in typeNodes || node.type == IDENTIFIER
