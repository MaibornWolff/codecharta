package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.DECORATOR
import de.maibornwolff.treesitter.excavationsite.languages.javascript.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.TYPE_IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

/**
 * Extracts identifiers from class declaration including decorators.
 */
internal fun extractIdentifiersFromClassDeclaration(node: TSNode, sourceCode: String): List<String> {
    val decorators = node
        .children()
        .filter { it.type == DECORATOR }
        .mapNotNull { extractDecoratorName(it, sourceCode) }
        .toList()
    val className = TreeTraversal.findFirstChildTextByType(
        node,
        sourceCode,
        IDENTIFIER,
        TYPE_IDENTIFIER
    )
    return decorators + listOfNotNull(className)
}
