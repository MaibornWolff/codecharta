package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.languages.c.extractors.CDeclaratorParser
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

internal fun extractFromFunctionDefinition(node: SyntaxNode): String? = CDeclaratorParser.extractIdentifierFromDeclaratorField(node)
