package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal

private const val IDENTIFIER = "identifier"

internal fun extractFromPreprocessorDef(node: SyntaxNode, sourceCode: String): String? =
    TreeTraversal.findFirstChildTextByType(node, sourceCode, IDENTIFIER)
