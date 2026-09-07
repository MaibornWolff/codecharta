package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"
private const val FIELD_NAME = "name"

internal fun extractKeywordDeclaratorParameter(node: TSNode, sourceCode: String): String? {
    val name = node.getChildByFieldName(FIELD_NAME)
    if (name != null) {
        return TreeTraversal.getNodeText(name, sourceCode)
    }

    var lastIdentifier: String? = null
    for (i in 0 until node.childCount) {
        val child = node.getChild(i)
        if (child.type == IDENTIFIER) {
            lastIdentifier = TreeTraversal.getNodeText(child, sourceCode)
        }
    }
    return lastIdentifier
}
