package de.maibornwolff.treesitter.excavationsite.shared.domain

sealed class MetricCondition {
    abstract fun matches(node: SyntaxNode): Boolean

    data object Always : MetricCondition() {
        override fun matches(node: SyntaxNode): Boolean = true
    }

    data class ChildFieldMatches(val fieldName: String, val allowedTypes: Set<String>) : MetricCondition() {
        override fun matches(node: SyntaxNode): Boolean = hasType(node.getChildByFieldName(fieldName), allowedTypes)
    }

    /** [position] is 0-indexed, and the node must have exactly [requiredChildCount] children. */
    data class ChildPositionMatches(val position: Int, val requiredChildCount: Int, val allowedTypes: Set<String>) : MetricCondition() {
        override fun matches(node: SyntaxNode): Boolean =
            node.childCount == requiredChildCount && hasType(node.getChild(position), allowedTypes)
    }

    data class AnyChildMatches(val allowedTypes: Set<String>) : MetricCondition() {
        override fun matches(node: SyntaxNode): Boolean = node.children().any { it.type in allowedTypes }
    }

    data class ChildTextMatches(val childType: String, val allowedTexts: Set<String>) : MetricCondition() {
        override fun matches(node: SyntaxNode): Boolean = textsOfChildren(node, childType).any { it in allowedTexts }
    }

    /** Needs at least one child of [childType], such as an ICU case that is not the `other` case. */
    data class ChildTextDiffers(val childType: String, val excludedTexts: Set<String>) : MetricCondition() {
        override fun matches(node: SyntaxNode): Boolean {
            val texts = textsOfChildren(node, childType)
            return texts.isNotEmpty() && texts.none { it in excludedTexts }
        }
    }

    data class ParentMatches(val allowedTypes: Set<String>) : MetricCondition() {
        override fun matches(node: SyntaxNode): Boolean = node.parent.type in allowedTypes
    }

    data class NoAncestorMatches(val excludedTypes: Set<String>) : MetricCondition() {
        override fun matches(node: SyntaxNode): Boolean =
            generateSequence(node.parent.orNull()) { it.parent.orNull() }.none { it.type in excludedTypes }
    }

    data class AllOf(val conditions: List<MetricCondition>) : MetricCondition() {
        override fun matches(node: SyntaxNode): Boolean = conditions.all { it.matches(node) }
    }

    protected fun hasType(node: SyntaxNode, types: Set<String>): Boolean = !node.isNull && node.type in types

    protected fun textsOfChildren(node: SyntaxNode, childType: String): List<String> =
        node.children().filter { it.type == childType }.map { it.text.trim() }.toList()
}
