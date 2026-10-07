package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal

/**
 * Extracts type alias name: `type Point = tuple[int, int]`.
 */
internal fun extractFromTypeAlias(node: SyntaxNode, sourceCode: String, findFirstIdentifier: (SyntaxNode, String) -> String?): String? {
    val nameNode = node.getChildByFieldName("name")
    if (!nameNode.isNull) {
        return TreeTraversal.getNodeText(nameNode, sourceCode)
    }
    return findFirstIdentifier(node, sourceCode)
}
