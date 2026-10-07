package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children

private const val IDENTIFIER = "identifier"

internal fun extractFromStructuredBinding(node: SyntaxNode, sourceCode: String): List<String> = node
    .children()
    .filter { it.type == IDENTIFIER }
    .map { TreeTraversal.getNodeText(it, sourceCode) }
    .toList()
