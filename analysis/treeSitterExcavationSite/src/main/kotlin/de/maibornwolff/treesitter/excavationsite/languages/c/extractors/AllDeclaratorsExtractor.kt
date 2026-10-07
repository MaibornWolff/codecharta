package de.maibornwolff.treesitter.excavationsite.languages.c.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children

private const val IDENTIFIER = "identifier"
private const val INIT_DECLARATOR = "init_declarator"
private const val POINTER_DECLARATOR = "pointer_declarator"
private const val ARRAY_DECLARATOR = "array_declarator"
private const val FUNCTION_DECLARATOR = "function_declarator"

/**
 * Extracts all declarator identifiers from a declaration with multiple declarators.
 * Example: int a, b, c; extracts ["a", "b", "c"]
 */
internal fun extractAllDeclarators(node: SyntaxNode, sourceCode: String): List<String> {
    val identifiers = node
        .children()
        .mapNotNull { extractIdentifierFromDeclaratorChild(it, sourceCode) }
        .distinct()
        .toList()

    return identifiers.ifEmpty { listOfNotNull(extractFromDeclaration(node, sourceCode)) }
}

/**
 * Extracts identifier from a single declarator child node.
 */
private fun extractIdentifierFromDeclaratorChild(child: SyntaxNode, sourceCode: String): String? = when (child.type) {
    INIT_DECLARATOR -> {
        CDeclaratorParser.extractFromInitDeclarator(child, sourceCode)
    }
    POINTER_DECLARATOR,
    ARRAY_DECLARATOR,
    FUNCTION_DECLARATOR -> {
        CDeclaratorParser.findIdentifierInDeclarator(child, sourceCode)
    }
    IDENTIFIER -> TreeTraversal.getNodeText(child, sourceCode)
    else -> null
}
