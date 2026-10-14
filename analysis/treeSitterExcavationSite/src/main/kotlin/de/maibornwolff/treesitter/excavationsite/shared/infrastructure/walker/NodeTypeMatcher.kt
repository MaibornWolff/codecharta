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

    fun isNestedTypeAllowed(node: SyntaxNode, nodeType: String, nestedTypes: Set<NestedNodeType>): Boolean {
        for (nestedType in nestedTypes) {
            if (nestedType.baseNodeType != nodeType) continue

            if (nestedType.parentNodeTypes != null) {
                if (nestedType.parentNodeTypes.contains(node.parent.type)) return true
            } else if (nestedType.matchesAnyChild) {
                if (node.children().any { nestedType.childNodeTypes.contains(it.type) }) return true
            } else if (nestedType.childNodePosition != null && nestedType.childNodeCount == node.childCount) {
                val childNode = node.getChild(nestedType.childNodePosition)
                if (!childNode.isNull && nestedType.childNodeTypes.contains(childNode.type)) return true
            } else if (nestedType.childNodeFieldName != null) {
                val childNode = node.getChildByFieldName(nestedType.childNodeFieldName)
                if (!childNode.isNull && nestedType.childNodeTypes.contains(childNode.type)) return true
            }
        }
        return false
    }
}
