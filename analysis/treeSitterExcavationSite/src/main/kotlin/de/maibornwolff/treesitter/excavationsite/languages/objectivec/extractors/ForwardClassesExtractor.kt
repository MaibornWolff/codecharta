package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children

private const val IDENTIFIER = "identifier"
private const val TYPE_IDENTIFIER = "type_identifier"

internal fun extractAllForwardClasses(node: SyntaxNode, sourceCode: String): List<String> = node
    .children()
    .filter { it.type == IDENTIFIER || it.type == TYPE_IDENTIFIER }
    .map { TreeTraversal.getNodeText(it, sourceCode) }
    .toList()
