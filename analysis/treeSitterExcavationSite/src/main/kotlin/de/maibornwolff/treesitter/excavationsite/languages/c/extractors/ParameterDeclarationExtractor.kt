package de.maibornwolff.treesitter.excavationsite.languages.c.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * Extracts identifier from parameter declaration.
 */
internal fun extractFromParameterDeclaration(node: SyntaxNode, sourceCode: String): String? =
    CDeclaratorParser.extractIdentifierFromDeclaratorField(node, sourceCode)
