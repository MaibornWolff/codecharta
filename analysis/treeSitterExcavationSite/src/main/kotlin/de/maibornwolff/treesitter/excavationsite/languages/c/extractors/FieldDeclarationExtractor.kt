package de.maibornwolff.treesitter.excavationsite.languages.c.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.children

private const val FIELD_IDENTIFIER = "field_identifier"
private const val POINTER_DECLARATOR = "pointer_declarator"
private const val ARRAY_DECLARATOR = "array_declarator"
private const val FIELD_DECLARATOR = "declarator"

/**
 * Extracts identifier from field declaration in struct/union.
 */
internal fun extractFromFieldDeclaration(node: SyntaxNode): String? {
    val declarator = node.getChildByFieldName(FIELD_DECLARATOR)
    if (!declarator.isNull) {
        return CDeclaratorParser.findIdentifierInDeclarator(declarator)
    }

    for (child in node.children()) {
        when (child.type) {
            FIELD_IDENTIFIER -> {
                return child.text
            }
            POINTER_DECLARATOR,
            ARRAY_DECLARATOR -> {
                return CDeclaratorParser.findIdentifierInDeclarator(child)
            }
        }
    }
    return null
}
