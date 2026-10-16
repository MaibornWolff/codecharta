package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * A condition a node must meet for a metric to count it; each condition checks a node itself.
 */
sealed class MetricCondition {
    abstract fun matches(node: SyntaxNode): Boolean

    /** Always matches - no additional condition required. */
    data object Always : MetricCondition() {
        override fun matches(node: SyntaxNode): Boolean = true
    }

    /**
     * Matches when the child at a field has one of the allowed types.
     *
     * @param fieldName The field name to look up the child node
     * @param allowedValues The set of allowed node types
     */
    data class ChildFieldMatches(val fieldName: String, val allowedValues: Set<String>) : MetricCondition() {
        override fun matches(node: SyntaxNode): Boolean = hasType(node.getChildByFieldName(fieldName), allowedValues)
    }

    /**
     * Matches when the node has exactly [requiredChildCount] children and the one at [position] has an allowed type.
     *
     * @param position The position of the child node (0-indexed)
     * @param requiredChildCount The required number of children for this match
     * @param allowedTypes The set of allowed node types
     */
    data class ChildPositionMatches(val position: Int, val requiredChildCount: Int, val allowedTypes: Set<String>) : MetricCondition() {
        override fun matches(node: SyntaxNode): Boolean =
            node.childCount == requiredChildCount && hasType(node.getChild(position), allowedTypes)
    }

    /**
     * Matches when any direct child node has one of the allowed types.
     *
     * @param allowedTypes The set of allowed node types
     */
    data class AnyChildMatches(val allowedTypes: Set<String>) : MetricCondition() {
        override fun matches(node: SyntaxNode): Boolean = node.children().any { it.type in allowedTypes }
    }

    /**
     * Matches when a direct child node of the given type has one of the allowed texts, such as the name of an
     * Angular structural directive.
     *
     * @param childType The type of the child node
     * @param allowedTexts The set of allowed texts of that child
     */
    data class ChildTextMatches(val childType: String, val allowedTexts: Set<String>) : MetricCondition() {
        override fun matches(node: SyntaxNode): Boolean = textsOfChildren(node, childType).any { it in allowedTexts }
    }

    /**
     * Matches when the node has a direct child of the given type and none of these children has one of the excluded
     * texts, such as an ICU case that is not the `other` case.
     *
     * @param childType The type of the child node
     * @param excludedTexts The set of texts of that child that keep the node from matching
     */
    data class ChildTextDiffers(val childType: String, val excludedTexts: Set<String>) : MetricCondition() {
        override fun matches(node: SyntaxNode): Boolean {
            val texts = textsOfChildren(node, childType)
            return texts.isNotEmpty() && texts.none { it in excludedTexts }
        }
    }

    /**
     * Matches when the parent node has one of the allowed types.
     *
     * @param allowedTypes The set of allowed node types
     */
    data class ParentMatches(val allowedTypes: Set<String>) : MetricCondition() {
        override fun matches(node: SyntaxNode): Boolean = node.parent.type in allowedTypes
    }

    /** Matches when no node around the node has one of the [excludedTypes], such as a table a routine creates. */
    data class NoAncestorMatches(val excludedTypes: Set<String>) : MetricCondition() {
        override fun matches(node: SyntaxNode): Boolean =
            generateSequence(node.parent.orNull()) { it.parent.orNull() }.none { it.type in excludedTypes }
    }

    /** Matches when every one of [conditions] matches. */
    data class AllOf(val conditions: List<MetricCondition>) : MetricCondition() {
        override fun matches(node: SyntaxNode): Boolean = conditions.all { it.matches(node) }
    }

    protected fun hasType(node: SyntaxNode, types: Set<String>): Boolean = !node.isNull && node.type in types

    protected fun textsOfChildren(node: SyntaxNode, childType: String): List<String> =
        node.children().filter { it.type == childType }.map { it.text.trim() }.toList()
}
