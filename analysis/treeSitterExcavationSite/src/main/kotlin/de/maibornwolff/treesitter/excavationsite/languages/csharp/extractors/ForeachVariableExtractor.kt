package de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.children

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
internal fun extractForeachVariable(node: SyntaxNode): String? {
    val childrenBeforeIn = node
        .children()
        .takeWhile { it.type != IN_KEYWORD }
        .toList()
    return findVariableAfterType(childrenBeforeIn)
}

private fun findVariableAfterType(children: List<SyntaxNode>): String? {
    val indexOfType = children.indexOfFirst { isTypeNode(it) }
    if (indexOfType < 0) return null

    return children
        .drop(indexOfType + 1)
        .firstOrNull { it.type == IDENTIFIER }
        ?.text
}

private fun isTypeNode(node: SyntaxNode): Boolean = node.type in typeNodes || node.type == IDENTIFIER
