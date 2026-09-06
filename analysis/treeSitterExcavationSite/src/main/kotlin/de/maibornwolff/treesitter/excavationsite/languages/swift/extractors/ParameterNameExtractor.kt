package de.maibornwolff.treesitter.excavationsite.languages.swift.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val SIMPLE_IDENTIFIER = "simple_identifier"

/**
 * Extracts parameter name from parameter/lambda_parameter node.
 *
 * Swift parameters can have external and internal names. The internal name
 * (last simple_identifier) is extracted for domain relevance.
 */
internal fun extractParameterName(node: TSNode, sourceCode: String): String? = node
    .children()
    .lastOrNull { it.type == SIMPLE_IDENTIFIER }
    ?.let { TreeTraversal.getNodeText(it, sourceCode) }
