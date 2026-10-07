package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children

private const val PARAMETER_DECLARATION = "parameter_declaration"

internal fun extractFromCatchClause(node: SyntaxNode): String? {
    for (child in node.children()) {
        if (child.type == PARAMETER_DECLARATION) {
            return extractFromParameterDeclaration(child)
        }
    }
    return null
}
