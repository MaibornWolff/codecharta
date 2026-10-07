package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal

private const val IDENTIFIER = "identifier"

internal fun extractCategoryIdentifier(node: SyntaxNode, sourceCode: String): String? {
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
