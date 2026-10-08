package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * Extracts all identifiers from a node (used for global/nonlocal statements).
 */
internal fun extractAllIdentifiers(node: SyntaxNode): List<String> = node
    .children()
    .filter { it.type == "identifier" }
    .map { it.text }
    .toList()
