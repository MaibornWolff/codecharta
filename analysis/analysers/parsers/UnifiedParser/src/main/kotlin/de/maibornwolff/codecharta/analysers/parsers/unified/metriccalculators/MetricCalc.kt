package de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.NestedNodeType
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.TreeNodeTypes
import org.treesitter.TSNode

interface MetricCalc {
    fun isNodeTypeAllowed(node: TSNode, nodeType: String, allowedTypes: TreeNodeTypes): Boolean {
        if (allowedTypes.simpleNodeTypes.contains(nodeType)) {
            return true
        } else if (allowedTypes.nestedNodeTypes != null) {
            return isNestedTypeAllowed(node, nodeType, allowedTypes.nestedNodeTypes)
        }
        return false
    }

    fun isNestedTypeAllowed(node: TSNode, nodeType: String, nestedTypes: Set<NestedNodeType>): Boolean {
        for (nestedType in nestedTypes) {
            if (nestedType.baseNodeType != nodeType) continue

            if (nestedType.childNodePosition != null && nestedType.childNodeCount == node.childCount) {
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
