package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.languages.c.extractors.CDeclaratorParser
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.children

private const val PARAMETER_DECLARATION = "parameter_declaration"
private const val POINTER_DECLARATOR = "pointer_declarator"

internal fun extractFromCatchClause(node: SyntaxNode): String? {
    for (child in node.children()) {
        when (child.type) {
            PARAMETER_DECLARATION -> return extractFromParameterDeclaration(child)
            POINTER_DECLARATOR -> {
                return CDeclaratorParser.findIdentifierInDeclarator(child)
            }
        }
    }
    return null
}
