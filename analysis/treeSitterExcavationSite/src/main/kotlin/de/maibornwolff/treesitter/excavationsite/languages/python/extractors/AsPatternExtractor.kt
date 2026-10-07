package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/**
 * Extracts as-pattern alias: `with open(f) as file` -> "file".
 * Returns null for as_pattern inside case_clause (handled by pattern matching).
 */
internal fun extractFromAsPattern(
    node: SyntaxNode,
    findFirstIdentifier: (SyntaxNode) -> String?,
    findLastIdentifier: (SyntaxNode) -> String?
): String? {
    if (TreeTraversal.hasAncestorOfType(node, "case_clause")) return null

    val aliasNode = node.getChildByFieldName("alias")
    if (aliasNode.isNull) {
        return findLastIdentifier(node)
    }

    return if (aliasNode.type == "identifier") {
        aliasNode.text
    } else {
        findFirstIdentifier(aliasNode)
    }
}
