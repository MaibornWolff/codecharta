package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"

internal fun extractCategoryIdentifier(node: TSNode, sourceCode: String): String? {
    var foundFirst = false
    for (i in 0 until node.childCount) {
        val child = node.getChild(i)
        if (child.type == IDENTIFIER) {
            if (foundFirst) {
                return TreeTraversal.getNodeText(child, sourceCode)
            }
            foundFirst = true
        }
    }
    return TreeTraversal.findChildByType(node, IDENTIFIER, sourceCode)
}
