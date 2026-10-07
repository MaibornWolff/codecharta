package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

private const val IDENTIFIER = "identifier"
private const val NAMESPACE_IDENTIFIER = "namespace_identifier"

internal fun extractFromNamespaceDefinition(node: SyntaxNode): String? = TreeTraversal.findFirstChildTextByType(node, IDENTIFIER)
    ?: TreeTraversal.findFirstChildTextByType(node, NAMESPACE_IDENTIFIER)
