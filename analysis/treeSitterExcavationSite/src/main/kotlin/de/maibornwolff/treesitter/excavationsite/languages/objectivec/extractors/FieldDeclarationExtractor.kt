package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.languages.c.extractors.CDeclaratorParser
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children

private const val IDENTIFIER = "identifier"
private const val FIELD_IDENTIFIER = "field_identifier"
private const val POINTER_DECLARATOR = "pointer_declarator"
private const val ARRAY_DECLARATOR = "array_declarator"
private const val FIELD_DECLARATOR = "declarator"

internal fun extractFromFieldDeclaration(node: SyntaxNode, sourceCode: String): String? {
    val declarator = node.getChildByFieldName(FIELD_DECLARATOR)
    if (!declarator.isNull) {
        return CDeclaratorParser.findIdentifierInDeclarator(declarator, sourceCode)
    }
    for (child in node.children()) {
        when (child.type) {
            FIELD_IDENTIFIER -> return TreeTraversal.getNodeText(child, sourceCode)
            IDENTIFIER -> return TreeTraversal.getNodeText(child, sourceCode)
            POINTER_DECLARATOR, ARRAY_DECLARATOR -> {
                return CDeclaratorParser.findIdentifierInDeclarator(child, sourceCode)
            }
        }
    }
    return null
}
