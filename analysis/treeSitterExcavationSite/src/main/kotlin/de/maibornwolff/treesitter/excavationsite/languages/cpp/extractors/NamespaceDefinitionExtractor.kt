package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"
private const val NAMESPACE_IDENTIFIER = "namespace_identifier"

internal fun extractFromNamespaceDefinition(node: TSNode, sourceCode: String): String? =
    TreeTraversal.findFirstChildTextByType(node, sourceCode, IDENTIFIER)
        ?: TreeTraversal.findFirstChildTextByType(node, sourceCode, NAMESPACE_IDENTIFIER)
