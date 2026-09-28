package de.maibornwolff.treesitter.excavationsite.languages.c.extractors

import org.treesitter.TSNode

/**
 * Extracts identifier from function definition.
 * C's declarator syntax requires recursive traversal through pointer/array/function declarators.
 */
internal fun extractFromFunctionDefinition(node: TSNode, sourceCode: String): String? =
    CDeclaratorParser.extractIdentifierFromDeclaratorField(node, sourceCode)
