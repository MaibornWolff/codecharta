package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"
private const val TYPE_IDENTIFIER = "type_identifier"

internal fun extractFromProtocolForwardDeclaration(node: TSNode, sourceCode: String): String? =
    TreeTraversal.findFirstChildTextByType(node, sourceCode, IDENTIFIER, TYPE_IDENTIFIER)
