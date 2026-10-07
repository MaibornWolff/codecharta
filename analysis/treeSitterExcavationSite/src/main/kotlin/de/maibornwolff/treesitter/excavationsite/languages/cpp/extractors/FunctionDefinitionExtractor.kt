package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.languages.c.extractors.CDeclaratorParser
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

internal fun extractFromFunctionDefinition(node: SyntaxNode): String? = CDeclaratorParser.extractIdentifierFromDeclaratorField(node)
