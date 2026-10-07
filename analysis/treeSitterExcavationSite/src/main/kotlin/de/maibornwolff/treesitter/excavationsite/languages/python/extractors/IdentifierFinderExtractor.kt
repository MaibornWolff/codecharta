package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children

/**
 * Finds the first identifier child in a node.
 */
internal fun findFirstIdentifier(node: SyntaxNode): String? = node
    .children()
    .firstOrNull { it.type == "identifier" }
    ?.text

/**
 * Finds the last identifier child in a node.
 */
internal fun findLastIdentifier(node: SyntaxNode): String? = node
    .children()
    .lastOrNull { it.type == "identifier" }
    ?.text
