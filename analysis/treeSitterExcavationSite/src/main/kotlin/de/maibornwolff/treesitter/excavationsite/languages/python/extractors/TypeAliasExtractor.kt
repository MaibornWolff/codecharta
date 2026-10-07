package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * Extracts type alias name: `type Point = tuple[int, int]`.
 */
internal fun extractFromTypeAlias(node: SyntaxNode, findFirstIdentifier: (SyntaxNode) -> String?): String? {
    val nameNode = node.getChildByFieldName("name")
    if (!nameNode.isNull) {
        return nameNode.text
    }
    return findFirstIdentifier(node)
}
