package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.languages.c.extractors.CDeclaratorParser
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal

private const val FIELD_IDENTIFIER = "field_identifier"
private const val FIELD_DECLARATOR = "declarator"
private const val POINTER_DECLARATOR = "pointer_declarator"
private const val ARRAY_DECLARATOR = "array_declarator"
private const val REFERENCE_DECLARATOR = "reference_declarator"

private val NESTED_DECLARATOR_TYPES = setOf(
    POINTER_DECLARATOR,
    ARRAY_DECLARATOR,
    REFERENCE_DECLARATOR
)

internal fun extractFromFieldDeclaration(node: SyntaxNode, sourceCode: String): String? {
    val declarator = node.getChildByFieldName(FIELD_DECLARATOR)
    if (!declarator.isNull) {
        return CDeclaratorParser.findIdentifierInDeclarator(declarator, sourceCode)
    }

    for (i in 0 until node.childCount) {
        val child = node.getChild(i)
        if (child.type == FIELD_IDENTIFIER) {
            return TreeTraversal.getNodeText(child, sourceCode)
        }
        if (child.type in NESTED_DECLARATOR_TYPES) {
            return CDeclaratorParser.findIdentifierInDeclarator(child, sourceCode)
        }
    }
    return null
}
