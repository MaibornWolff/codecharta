package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

/**
 * Finds the first identifier child in a node.
 */
internal fun findFirstIdentifier(node: TSNode, sourceCode: String): String? = node
    .children()
    .firstOrNull { it.type == "identifier" }
    ?.let { TreeTraversal.getNodeText(it, sourceCode) }

/**
 * Finds the last identifier child in a node.
 */
internal fun findLastIdentifier(node: TSNode, sourceCode: String): String? = node
    .children()
    .lastOrNull { it.type == "identifier" }
    ?.let { TreeTraversal.getNodeText(it, sourceCode) }
