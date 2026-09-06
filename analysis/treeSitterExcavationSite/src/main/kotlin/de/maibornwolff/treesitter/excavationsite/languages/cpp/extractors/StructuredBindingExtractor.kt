package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"

internal fun extractFromStructuredBinding(node: TSNode, sourceCode: String): List<String> = node
    .children()
    .filter { it.type == IDENTIFIER }
    .map { TreeTraversal.getNodeText(it, sourceCode) }
    .toList()
