package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * Extracts identifier from simple assignments only.
 * Tuple unpacking and other complex assignments are not extracted.
 */
internal fun extractFromAssignment(node: SyntaxNode): String? = node
    .children()
    .firstOrNull()
    ?.takeIf { it.type == "identifier" }
    ?.text
