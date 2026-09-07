package de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"

/**
 * Finds the last identifier child in a node.
 *
 * Used for parameter, catch_declaration, and declaration_pattern.
 */
internal fun findLastIdentifier(node: TSNode, sourceCode: String): String? = node
    .children()
    .lastOrNull { it.type == IDENTIFIER }
    ?.let { TreeTraversal.getNodeText(it, sourceCode) }
