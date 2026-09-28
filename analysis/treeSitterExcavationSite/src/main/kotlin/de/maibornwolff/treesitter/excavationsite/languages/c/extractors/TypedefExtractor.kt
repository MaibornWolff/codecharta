package de.maibornwolff.treesitter.excavationsite.languages.c.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val TYPE_IDENTIFIER = "type_identifier"
private const val POINTER_DECLARATOR = "pointer_declarator"
private const val ARRAY_DECLARATOR = "array_declarator"
private const val FUNCTION_DECLARATOR = "function_declarator"
private const val FIELD_DECLARATOR = "declarator"

/**
 * Extracts identifier from typedef.
 * Example: typedef int (*func_ptr)(int); extracts "func_ptr"
 */
internal fun extractFromTypedef(node: TSNode, sourceCode: String): String? {
    val declarator = node.getChildByFieldName(FIELD_DECLARATOR)
    if (declarator != null) {
        return CDeclaratorParser.findIdentifierInDeclarator(declarator, sourceCode)
    }

    for (child in node.children()) {
        when (child.type) {
            TYPE_IDENTIFIER -> {
                return TreeTraversal.getNodeText(child, sourceCode)
            }
            POINTER_DECLARATOR,
            ARRAY_DECLARATOR,
            FUNCTION_DECLARATOR -> {
                return CDeclaratorParser.findIdentifierInDeclarator(child, sourceCode)
            }
        }
    }
    return null
}
