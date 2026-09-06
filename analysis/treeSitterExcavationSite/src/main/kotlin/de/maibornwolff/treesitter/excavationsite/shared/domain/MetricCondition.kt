package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Represents a condition that must be met for a metric to be counted.
 *
 * This is a feature-local concept for the metrics feature, replacing the
 * infrastructure-level NestedNodeType. The condition is evaluated by the
 * adapter layer using the tree walker infrastructure.
 */
sealed class MetricCondition {
    /**
     * Always matches - no additional condition required.
     */
    data object Always : MetricCondition()

    /**
     * Matches when a child node at a specific field has one of the allowed values.
     *
     * @param fieldName The field name to look up the child node
     * @param allowedValues The set of allowed node types or text values
     */
    data class ChildFieldMatches(val fieldName: String, val allowedValues: Set<String>) : MetricCondition()

    /**
     * Matches when a child node at a specific position has one of the allowed types.
     *
     * @param position The position of the child node (0-indexed)
     * @param requiredChildCount The required number of children for this match
     * @param allowedTypes The set of allowed node types
     */
    data class ChildPositionMatches(val position: Int, val requiredChildCount: Int, val allowedTypes: Set<String>) : MetricCondition()
}
