package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators.CalculationExtensions
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.CNodeTypes
import org.treesitter.TSNode
import org.treesitter.TreeSitterC

class CCollector : MetricCollector(
    treeSitterLanguage = TreeSitterC(),
    nodeTypeProvider = CNodeTypes(),
    calculationExtensions = CalculationExtensions(
        ignoreNodeForComplexity = { node: TSNode, nodeType: String ->
            CNodeTypes.shouldIgnoreFnDeclaratorInFnDefinition(node, nodeType)
        }
    )
)
