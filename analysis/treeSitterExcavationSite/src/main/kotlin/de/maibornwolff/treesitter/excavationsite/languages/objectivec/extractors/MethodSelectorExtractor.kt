package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"
private const val KEYWORD_DECLARATOR = "keyword_declarator"
private const val KEYWORD_SELECTOR = "keyword_selector"
private const val SELECTOR = "selector"
private const val FIELD_KEYWORD = "keyword"

internal fun extractMethodSelector(node: TSNode, sourceCode: String): String? {
    val selector = node.getChildByFieldName(SELECTOR)
    if (selector != null) {
        return extractSelectorBaseName(selector, sourceCode)
    }

    for (i in 0 until node.childCount) {
        val child = node.getChild(i)
        when (child.type) {
            SELECTOR -> return TreeTraversal.getNodeText(child, sourceCode)
            KEYWORD_SELECTOR -> return extractFirstKeyword(child, sourceCode)
        }
    }
    return null
}

private fun extractSelectorBaseName(selector: TSNode, sourceCode: String): String? = when (selector.type) {
    SELECTOR -> TreeTraversal.getNodeText(selector, sourceCode)
    KEYWORD_SELECTOR -> extractFirstKeyword(selector, sourceCode)
    IDENTIFIER -> TreeTraversal.getNodeText(selector, sourceCode)
    else -> TreeTraversal.findChildByType(selector, IDENTIFIER, sourceCode)
        ?: extractFirstKeyword(selector, sourceCode)
}

private fun extractFirstKeyword(node: TSNode, sourceCode: String): String? {
    for (i in 0 until node.childCount) {
        val child = node.getChild(i)
        if (child.type == KEYWORD_DECLARATOR) {
            val keyword = child.getChildByFieldName(FIELD_KEYWORD)
            if (keyword != null) {
                return TreeTraversal.getNodeText(keyword, sourceCode)
            }
            return TreeTraversal.findChildByType(child, IDENTIFIER, sourceCode)
        }
    }
    return null
}
