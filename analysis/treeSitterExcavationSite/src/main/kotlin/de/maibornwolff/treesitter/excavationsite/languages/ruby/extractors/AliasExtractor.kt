package de.maibornwolff.treesitter.excavationsite.languages.ruby.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"

/**
 * Extracts both identifiers from alias: `alias new_name old_name`
 */
internal fun extractAliasIdentifiers(node: TSNode, sourceCode: String): List<String> = node
    .children()
    .filter { it.type == IDENTIFIER }
    .map { TreeTraversal.getNodeText(it, sourceCode) }
    .toList()
