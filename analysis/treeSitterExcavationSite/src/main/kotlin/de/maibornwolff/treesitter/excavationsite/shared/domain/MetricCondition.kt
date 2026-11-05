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

    data class ChildTextMatches(val childType: String, val allowedTexts: Set<String>, val ignoreCase: Boolean = false) : MetricCondition() {
        override fun matches(node: SyntaxNode): Boolean =
            textsOfChildren(node, childType).any { text -> allowedTexts.any { it.equals(text, ignoreCase) } }
    }

    /** Needs at least one child of [childType], such as an ICU case that is not the `other` case. */
    data class ChildTextDiffers(val childType: String, val excludedTexts: Set<String>) : MetricCondition() {
        override fun matches(node: SyntaxNode): Boolean {
            val texts = textsOfChildren(node, childType)
            return texts.isNotEmpty() && texts.none { it in excludedTexts }
        }
    }

    data class TextMatches(val pattern: Regex) : MetricCondition() {
        override fun matches(node: SyntaxNode): Boolean = pattern.matches(node.text)
    }

    /** For grammars that leave the operator token out of the tree: the first word between the first and the last child. */
    data class HiddenOperatorMatches(val allowedOperators: Set<String>) : MetricCondition() {
        override fun matches(node: SyntaxNode): Boolean {
            if (node.childCount < 2) return false
            val betweenOperands = node.text.removePrefix(node.getChild(0).text).removeSuffix(node.getChild(node.childCount - 1).text)
            val operator = betweenOperands.trim().substringBefore(' ').substringBefore('\t')
            return allowedOperators.any { it.equals(operator, ignoreCase = true) }
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
