package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.StringParser
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

private const val STRING_LITERAL = "string_literal"

internal fun extractObjCStringExpression(node: SyntaxNode): String {
    for (i in 0 until node.childCount) {
        val child = node.getChild(i)
        if (child.type == STRING_LITERAL) {
            return StringParser.stripQuotes(child.text)
        }
    }
    val text = node.text
    val withoutAt = if (text.startsWith("@")) text.substring(1) else text
    return StringParser.stripQuotes(withoutAt)
}
