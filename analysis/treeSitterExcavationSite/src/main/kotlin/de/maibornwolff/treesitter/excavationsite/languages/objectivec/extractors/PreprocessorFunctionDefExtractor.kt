package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

private const val IDENTIFIER = "identifier"

internal fun extractFromPreprocessorFunctionDef(node: SyntaxNode): String? = TreeTraversal.findFirstChildTextByType(node, IDENTIFIER)
