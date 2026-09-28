package de.maibornwolff.treesitter.excavationsite.integration.metrics.ports

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeNodeTypes

interface MetricNodeTypes {
    val logicComplexityNodeTypes: TreeNodeTypes
    val functionComplexityNodeTypes: TreeNodeTypes
    val commentLineNodeTypes: TreeNodeTypes
    val numberOfFunctionsNodeTypes: TreeNodeTypes
    val functionBodyNodeTypes: TreeNodeTypes
    val functionParameterNodeTypes: TreeNodeTypes
    val messageChainsNodeTypes: TreeNodeTypes
    val messageChainsCallNodeTypes: TreeNodeTypes
}
