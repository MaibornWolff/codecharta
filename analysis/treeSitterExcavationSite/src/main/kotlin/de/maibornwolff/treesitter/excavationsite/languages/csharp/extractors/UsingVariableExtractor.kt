package de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

private const val VARIABLE_DECLARATION = "variable_declaration"

/**
 * Extracts variable from using statement: `using (var reader = ...)`
 */
internal fun extractUsingVariable(node: SyntaxNode): String? {
    for (child in node.children()) {
        if (child.type == VARIABLE_DECLARATION) {
            return findIdentifierInVariableDeclarator(child)
        }
    }
    return null
}
