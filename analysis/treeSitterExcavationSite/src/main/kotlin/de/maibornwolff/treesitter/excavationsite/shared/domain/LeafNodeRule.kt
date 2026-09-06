package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Declarative rules for counting nodes as leaf nodes during RLOC calculation.
 *
 * Leaf nodes are terminal nodes in the AST that contribute to line counting.
 * Some languages need special handling for certain node types.
 */
sealed class LeafNodeRule {
    /**
     * Count node as leaf when parent has multiple children.
     * Used for Python: "string" is a leaf node when parent.childCount != 1
     * (strings that are NOT docstrings).
     */
    data class WhenParentHasMultipleChildren(val nodeType: String) : LeafNodeRule()
}
