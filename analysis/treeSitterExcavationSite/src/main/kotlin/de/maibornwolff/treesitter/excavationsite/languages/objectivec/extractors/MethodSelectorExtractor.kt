package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal

private const val IDENTIFIER = "identifier"
private const val KEYWORD_DECLARATOR = "keyword_declarator"
private const val KEYWORD_SELECTOR = "keyword_selector"
private const val SELECTOR = "selector"
private const val FIELD_KEYWORD = "keyword"

internal fun extractMethodSelector(node: SyntaxNode): String? {
    val selector = node.getChildByFieldName(SELECTOR)
    if (!selector.isNull) {
        return extractSelectorBaseName(selector)
    }

    for (i in 0 until node.childCount) {
        val child = node.getChild(i)
        when (child.type) {
            SELECTOR -> return child.text
            KEYWORD_SELECTOR -> return extractFirstKeyword(child)
        }
    }
    return null
}

private fun extractSelectorBaseName(selector: SyntaxNode): String? = when (selector.type) {
    SELECTOR -> selector.text
    KEYWORD_SELECTOR -> extractFirstKeyword(selector)
    IDENTIFIER -> selector.text
    else -> TreeTraversal.findFirstChildTextByType(selector, IDENTIFIER)
        ?: extractFirstKeyword(selector)
}

private fun extractFirstKeyword(node: SyntaxNode): String? {
    for (i in 0 until node.childCount) {
        val child = node.getChild(i)
        if (child.type == KEYWORD_DECLARATOR) {
            // Without a keyword, as in `- (void):(int)x`, the only identifier is the parameter, not a method name
            return child.getChildByFieldName(FIELD_KEYWORD).orNull()?.text
        }
    }
    return null
}
