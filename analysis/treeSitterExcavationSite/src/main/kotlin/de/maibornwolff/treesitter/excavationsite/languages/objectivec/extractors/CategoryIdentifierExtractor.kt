package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

private const val IDENTIFIER = "identifier"

internal fun extractCategoryIdentifier(node: SyntaxNode): String? {
    var foundFirst = false
    for (i in 0 until node.childCount) {
        val child = node.getChild(i)
        if (child.type == IDENTIFIER) {
            if (foundFirst) {
                return child.text
            }
            foundFirst = true
        }
    }
    return TreeTraversal.findFirstChildTextByType(node, IDENTIFIER)
}
