package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.languages.c.extractors.CDeclaratorParser
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"
private const val FIELD_IDENTIFIER = "field_identifier"
private const val POINTER_DECLARATOR = "pointer_declarator"
private const val ARRAY_DECLARATOR = "array_declarator"
private const val FIELD_DECLARATION = "field_declaration"
private const val FIELD_DECLARATOR = "declarator"

internal fun extractPropertyIdentifier(node: TSNode, sourceCode: String): String? {
    for (i in 0 until node.childCount) {
        val child = node.getChild(i)
        when (child.type) {
            POINTER_DECLARATOR, ARRAY_DECLARATOR -> {
                return CDeclaratorParser.findIdentifierInDeclarator(child, sourceCode)
            }
            FIELD_DECLARATION -> {
                val declarator = child.getChildByFieldName(FIELD_DECLARATOR)
                if (declarator != null) {
                    return CDeclaratorParser.findIdentifierInDeclarator(declarator, sourceCode)
                }
                val result = TreeTraversal.findChildByType(child, IDENTIFIER, sourceCode)
                    ?: TreeTraversal.findChildByType(child, FIELD_IDENTIFIER, sourceCode)
                if (result != null) return result
            }
        }
    }
    return TreeTraversal.findChildByType(node, IDENTIFIER, sourceCode)
        ?: TreeTraversal.findChildByType(node, FIELD_IDENTIFIER, sourceCode)
}
