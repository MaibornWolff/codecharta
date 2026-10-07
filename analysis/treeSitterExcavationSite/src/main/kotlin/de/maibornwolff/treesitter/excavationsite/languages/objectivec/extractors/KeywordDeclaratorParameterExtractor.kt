package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

private const val IDENTIFIER = "identifier"
private const val FIELD_NAME = "name"

internal fun extractKeywordDeclaratorParameter(node: SyntaxNode): String? {
    val name = node.getChildByFieldName(FIELD_NAME)
    if (!name.isNull) {
        return name.text
    }

    var lastIdentifier: String? = null
    for (i in 0 until node.childCount) {
        val child = node.getChild(i)
        if (child.type == IDENTIFIER) {
            lastIdentifier = child.text
        }
    }
    return lastIdentifier
}
