package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal

private const val IDENTIFIER = "identifier"
private const val TYPE_IDENTIFIER = "type_identifier"

internal fun extractFromClassForwardDeclaration(node: SyntaxNode): String? =
    TreeTraversal.findFirstChildTextByType(node, IDENTIFIER, TYPE_IDENTIFIER)
