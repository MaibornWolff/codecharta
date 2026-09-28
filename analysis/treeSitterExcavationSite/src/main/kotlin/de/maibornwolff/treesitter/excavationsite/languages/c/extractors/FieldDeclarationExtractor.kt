package de.maibornwolff.treesitter.excavationsite.languages.c.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val FIELD_IDENTIFIER = "field_identifier"
private const val POINTER_DECLARATOR = "pointer_declarator"
private const val ARRAY_DECLARATOR = "array_declarator"
private const val FIELD_DECLARATOR = "declarator"

/**
 * Extracts identifier from field declaration in struct/union.
 */
internal fun extractFromFieldDeclaration(node: TSNode, sourceCode: String): String? {
    val declarator = node.getChildByFieldName(FIELD_DECLARATOR)
    if (declarator != null) {
        return CDeclaratorParser.findIdentifierInDeclarator(declarator, sourceCode)
    }

    for (child in node.children()) {
        when (child.type) {
            FIELD_IDENTIFIER -> {
                return TreeTraversal.getNodeText(child, sourceCode)
            }
            POINTER_DECLARATOR,
            ARRAY_DECLARATOR -> {
                return CDeclaratorParser.findIdentifierInDeclarator(child, sourceCode)
            }
        }
    }
    return null
}
