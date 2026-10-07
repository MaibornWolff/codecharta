package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.languages.c.extractors.CDeclaratorParser
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children

private const val IDENTIFIER = "identifier"
private const val QUALIFIED_IDENTIFIER = "qualified_identifier"

internal fun extractFromUsingDeclaration(node: SyntaxNode): String? {
    for (child in node.children()) {
        when (child.type) {
            QUALIFIED_IDENTIFIER -> return CDeclaratorParser.extractFromQualifiedIdentifier(child)
            IDENTIFIER -> return child.text
        }
    }
    return null
}
