package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.languages.c.extractors.CDeclaratorParser
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

internal fun extractFromFunctionDefinition(node: SyntaxNode, sourceCode: String): String? =
    CDeclaratorParser.extractIdentifierFromDeclaratorField(node, sourceCode)
