package de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

private const val IDENTIFIER = "identifier"

/**
 * Finds the last identifier child in a node.
 *
 * Used for parameter, catch_declaration, and declaration_pattern.
 */
internal fun findLastIdentifier(node: SyntaxNode): String? = node
    .children()
    .lastOrNull { it.type == IDENTIFIER }
    ?.text
