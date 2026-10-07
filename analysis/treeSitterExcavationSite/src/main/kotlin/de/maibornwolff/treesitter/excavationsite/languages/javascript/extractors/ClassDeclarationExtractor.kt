package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.DECORATOR
import de.maibornwolff.treesitter.excavationsite.languages.javascript.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.TYPE_IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.children

/**
 * Extracts identifiers from class declaration including decorators.
 */
internal fun extractIdentifiersFromClassDeclaration(node: SyntaxNode): List<String> {
    val decorators = node
        .children()
        .filter { it.type == DECORATOR }
        .mapNotNull { extractDecoratorName(it) }
        .toList()
    val className = TreeTraversal.findFirstChildTextByType(
        node,
        IDENTIFIER,
        TYPE_IDENTIFIER
    )
    return decorators + listOfNotNull(className)
}
