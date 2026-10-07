package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.StringParser
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal

private const val STRING_EXPRESSION = "string_expression"

internal fun extractCStringLiteral(node: SyntaxNode, sourceCode: String): String? {
    val parent = node.parent
    if (!parent.isNull && parent.type == STRING_EXPRESSION) {
        return null
    }
    return StringParser.stripQuotes(TreeTraversal.getNodeText(node, sourceCode))
}
