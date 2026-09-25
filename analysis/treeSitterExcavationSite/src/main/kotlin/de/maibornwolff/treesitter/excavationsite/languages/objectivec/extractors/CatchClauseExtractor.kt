package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.languages.c.extractors.CDeclaratorParser
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val PARAMETER_DECLARATION = "parameter_declaration"
private const val POINTER_DECLARATOR = "pointer_declarator"

internal fun extractFromCatchClause(node: TSNode, sourceCode: String): String? {
    for (child in node.children()) {
        when (child.type) {
            PARAMETER_DECLARATION -> return extractFromParameterDeclaration(child, sourceCode)
            POINTER_DECLARATOR -> {
                return CDeclaratorParser.findIdentifierInDeclarator(child, sourceCode)
            }
        }
    }
    return null
}
