package de.maibornwolff.treesitter.excavationsite.languages.c.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * Extracts identifier from function definition.
 * C's declarator syntax requires recursive traversal through pointer/array/function declarators.
 */
internal fun extractFromFunctionDefinition(node: SyntaxNode): String? = CDeclaratorParser.extractIdentifierFromDeclaratorField(node)
