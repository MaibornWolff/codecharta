package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val PARAMETER_DECLARATION = "parameter_declaration"

internal fun extractFromCatchClause(node: TSNode, sourceCode: String): String? {
    for (child in node.children()) {
        if (child.type == PARAMETER_DECLARATION) {
            return extractFromParameterDeclaration(child, sourceCode)
        }
    }
    return null
}
