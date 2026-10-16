package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

object NodeTypeMatcher {
    fun isNodeTypeAllowed(node: SyntaxNode, nodeType: String, allowedTypes: TreeNodeTypes): Boolean =
        nodeType in allowedTypes.simpleNodeTypes || allowedTypes.conditionalNodeTypes[nodeType].orEmpty().any { it.matches(node) }
}
