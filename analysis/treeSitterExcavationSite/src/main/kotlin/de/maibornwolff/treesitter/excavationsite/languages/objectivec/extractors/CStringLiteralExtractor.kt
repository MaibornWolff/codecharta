package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.StringParser
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

private const val STRING_EXPRESSION = "string_expression"

internal fun extractCStringLiteral(node: SyntaxNode): String? {
    val parent = node.parent
    if (!parent.isNull && parent.type == STRING_EXPRESSION) {
        return null
    }
    return StringParser.stripQuotes(node.text)
}
