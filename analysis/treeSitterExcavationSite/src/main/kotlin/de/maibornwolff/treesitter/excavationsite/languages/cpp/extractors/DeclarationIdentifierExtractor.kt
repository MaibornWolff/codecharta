package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.languages.c.extractors.CDeclaratorParser
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val STRUCTURED_BINDING_DECLARATOR = "structured_binding_declarator"
private const val INIT_DECLARATOR = "init_declarator"
private const val POINTER_DECLARATOR = "pointer_declarator"
private const val ARRAY_DECLARATOR = "array_declarator"
private const val REFERENCE_DECLARATOR = "reference_declarator"
private const val FUNCTION_DECLARATOR = "function_declarator"
private const val FIELD_DECLARATOR = "declarator"

internal fun extractFromDeclaration(node: TSNode, sourceCode: String): String? {
    if (TreeTraversal.containsNodeOfType(node, STRUCTURED_BINDING_DECLARATOR)) {
        return null
    }

    val declarator = node.getChildByFieldName(FIELD_DECLARATOR)
    if (!declarator.isNull) {
        return CDeclaratorParser.findIdentifierInDeclarator(declarator, sourceCode)
    }

    for (child in node.children()) {
        if (child.isNull) continue
        when (child.type) {
            INIT_DECLARATOR -> {
                return CDeclaratorParser.extractFromInitDeclarator(child, sourceCode)
            }
            POINTER_DECLARATOR, ARRAY_DECLARATOR, FUNCTION_DECLARATOR,
            REFERENCE_DECLARATOR -> {
                return CDeclaratorParser.findIdentifierInDeclarator(child, sourceCode)
            }
        }
    }
    return null
}
