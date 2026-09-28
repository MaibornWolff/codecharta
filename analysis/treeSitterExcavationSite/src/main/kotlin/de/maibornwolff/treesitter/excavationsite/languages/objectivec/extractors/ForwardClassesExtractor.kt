package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"
private const val TYPE_IDENTIFIER = "type_identifier"

internal fun extractAllForwardClasses(node: TSNode, sourceCode: String): List<String> = node
    .children()
    .filter { it.type == IDENTIFIER || it.type == TYPE_IDENTIFIER }
    .map { TreeTraversal.getNodeText(it, sourceCode) }
    .toList()
