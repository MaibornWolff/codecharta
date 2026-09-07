package de.maibornwolff.treesitter.excavationsite.languages.c.extractors

import org.treesitter.TSNode

/**
 * Extracts identifier from parameter declaration.
 */
internal fun extractFromParameterDeclaration(node: TSNode, sourceCode: String): String? =
    CDeclaratorParser.extractIdentifierFromDeclaratorField(node, sourceCode)
