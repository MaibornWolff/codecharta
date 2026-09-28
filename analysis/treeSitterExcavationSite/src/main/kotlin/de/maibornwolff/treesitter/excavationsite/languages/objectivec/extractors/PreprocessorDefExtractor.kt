package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"

internal fun extractFromPreprocessorDef(node: TSNode, sourceCode: String): String? =
    TreeTraversal.findFirstChildTextByType(node, sourceCode, IDENTIFIER)
