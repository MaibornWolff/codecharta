package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.children

private const val IDENTIFIER = "identifier"

internal fun extractFromStructuredBinding(node: SyntaxNode): List<String> = node
    .children()
    .filter { it.type == IDENTIFIER }
    .map { it.text }
    .toList()
