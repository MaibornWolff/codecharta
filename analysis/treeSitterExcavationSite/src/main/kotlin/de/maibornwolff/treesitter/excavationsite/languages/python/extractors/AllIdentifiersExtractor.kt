package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children

/**
 * Extracts all identifiers from a node (used for global/nonlocal statements).
 */
internal fun extractAllIdentifiers(node: SyntaxNode, sourceCode: String): List<String> = node
    .children()
    .filter { it.type == "identifier" }
    .map { TreeTraversal.getNodeText(it, sourceCode) }
    .toList()
