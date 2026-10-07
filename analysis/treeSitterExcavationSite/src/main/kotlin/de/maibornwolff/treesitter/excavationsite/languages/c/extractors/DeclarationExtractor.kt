package de.maibornwolff.treesitter.excavationsite.languages.c.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.children

private const val IDENTIFIER = "identifier"
private const val INIT_DECLARATOR = "init_declarator"
private const val POINTER_DECLARATOR = "pointer_declarator"
private const val ARRAY_DECLARATOR = "array_declarator"
private const val FUNCTION_DECLARATOR = "function_declarator"
private const val FIELD_DECLARATOR = "declarator"

/**
 * Extracts identifier from a declaration.
 * Handles various declarator types: int *ptr, int arr[10], int func(), etc.
 */
internal fun extractFromDeclaration(node: SyntaxNode): String? {
    val declarator = node.getChildByFieldName(FIELD_DECLARATOR)
    if (!declarator.isNull) {
        return CDeclaratorParser.findIdentifierInDeclarator(declarator)
    }

    for (child in node.children()) {
        when (child.type) {
            INIT_DECLARATOR -> {
                return CDeclaratorParser.extractFromInitDeclarator(child)
            }
            POINTER_DECLARATOR,
            ARRAY_DECLARATOR,
            FUNCTION_DECLARATOR,
            IDENTIFIER -> {
                return CDeclaratorParser.findIdentifierInDeclarator(child)
            }
        }
    }
    return null
}
