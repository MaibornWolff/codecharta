package de.maibornwolff.treesitter.excavationsite.languages.c.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * Extracts identifier from parameter declaration.
 */
internal fun extractFromParameterDeclaration(node: SyntaxNode): String? = CDeclaratorParser.extractIdentifierFromDeclaratorField(node)
