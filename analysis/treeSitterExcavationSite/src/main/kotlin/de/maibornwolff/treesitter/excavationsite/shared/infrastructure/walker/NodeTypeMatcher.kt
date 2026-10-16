package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

object NodeTypeMatcher {
    fun isNodeTypeAllowed(node: SyntaxNode, nodeType: String, allowedTypes: TreeNodeTypes): Boolean {
        if (allowedTypes.simpleNodeTypes.contains(nodeType)) {
            return true
        } else if (allowedTypes.nestedNodeTypes != null) {
            return isNestedTypeAllowed(node, nodeType, allowedTypes.nestedNodeTypes)
        }
        return false
    }

    fun isNestedTypeAllowed(node: SyntaxNode, nodeType: String, nestedTypes: Set<NestedNodeType>): Boolean =
        nestedTypes.any { nestedType -> nestedType.baseNodeType == nodeType && matches(node, nestedType) }

    private fun matches(node: SyntaxNode, nestedType: NestedNodeType): Boolean = when {
        nestedType.allOf != null -> nestedType.allOf.all { matches(node, it) }
        nestedType.parentNodeTypes != null -> nestedType.parentNodeTypes.contains(node.parent.type)
        nestedType.childNodeTexts != null -> node.children().any { child ->
            nestedType.childNodeTypes.contains(child.type) && nestedType.childNodeTexts.contains(child.text)
        }
        nestedType.matchesAnyChild -> node.children().any { nestedType.childNodeTypes.contains(it.type) }
        nestedType.childNodePosition != null && nestedType.childNodeCount == node.childCount ->
            isAllowedChild(node.getChild(nestedType.childNodePosition), nestedType)
        nestedType.childNodeFieldName != null -> isAllowedChild(node.getChildByFieldName(nestedType.childNodeFieldName), nestedType)
        else -> false
    }

    private fun isAllowedChild(childNode: SyntaxNode, nestedType: NestedNodeType): Boolean =
        !childNode.isNull && nestedType.childNodeTypes.contains(childNode.type)
}
