package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.languages.c.extractors.CDeclaratorParser
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.children

private const val IDENTIFIER = "identifier"
private const val DECLARATION = "declaration"
private const val POINTER_DECLARATOR = "pointer_declarator"
private const val ARRAY_DECLARATOR = "array_declarator"

internal fun extractFromForInStatement(node: SyntaxNode): String? {
    for (child in node.children()) {
        when (child.type) {
            DECLARATION -> return extractFromDeclaration(child)
            POINTER_DECLARATOR, ARRAY_DECLARATOR -> {
                return CDeclaratorParser.findIdentifierInDeclarator(child)
            }
            IDENTIFIER -> return child.text
        }
    }
    return null
}
