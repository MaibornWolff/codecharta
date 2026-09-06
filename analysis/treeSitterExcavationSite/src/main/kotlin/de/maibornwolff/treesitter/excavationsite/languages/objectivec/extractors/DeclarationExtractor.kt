package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.languages.c.extractors.CDeclaratorParser
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"
private const val INIT_DECLARATOR = "init_declarator"
private const val POINTER_DECLARATOR = "pointer_declarator"
private const val ARRAY_DECLARATOR = "array_declarator"
private const val FUNCTION_DECLARATOR = "function_declarator"
private const val FIELD_DECLARATOR = "declarator"

internal fun extractFromDeclaration(node: TSNode, sourceCode: String): String? {
    val declarator = node.getChildByFieldName(FIELD_DECLARATOR)
    if (declarator != null) {
        return CDeclaratorParser.findIdentifierInDeclarator(declarator, sourceCode)
    }

    for (i in 0 until node.childCount) {
        val child = node.getChild(i)
        when (child.type) {
            INIT_DECLARATOR -> return CDeclaratorParser.extractFromInitDeclarator(child, sourceCode)
            POINTER_DECLARATOR, ARRAY_DECLARATOR, FUNCTION_DECLARATOR, IDENTIFIER -> {
                return CDeclaratorParser.findIdentifierInDeclarator(child, sourceCode)
            }
        }
    }
    return null
}
