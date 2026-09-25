package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.languages.c.extractors.CDeclaratorParser
import org.treesitter.TSNode

internal fun extractFromParameterDeclaration(node: TSNode, sourceCode: String): String? =
    CDeclaratorParser.extractIdentifierFromDeclaratorField(node, sourceCode)
