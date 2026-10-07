package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.languages.c.extractors.CDeclaratorParser
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.children

private const val IDENTIFIER = "identifier"
private const val STRUCTURED_BINDING_DECLARATOR = "structured_binding_declarator"
private const val FIELD_DECLARATOR = "declarator"
private const val REFERENCE_DECLARATOR = "reference_declarator"
private const val POINTER_DECLARATOR = "pointer_declarator"

internal fun extractFromForRangeLoop(node: SyntaxNode): String? {
    if (TreeTraversal.containsNodeOfType(node, STRUCTURED_BINDING_DECLARATOR)) {
        return null
    }

    val declarator = node.getChildByFieldName(FIELD_DECLARATOR)
    if (!declarator.isNull) {
        return CDeclaratorParser.findIdentifierInDeclarator(declarator)
    }

    for (child in node.children()) {
        if (child.isNull) continue
        when (child.type) {
            IDENTIFIER -> return child.text
            REFERENCE_DECLARATOR, POINTER_DECLARATOR -> {
                return CDeclaratorParser.findIdentifierInDeclarator(child)
            }
        }
    }
    return null
}
