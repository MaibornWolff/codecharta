package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators.CalculationExtensions
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.CppNodeTypes
import org.treesitter.TSNode
import org.treesitter.TreeSitterCpp

class CppCollector : MetricCollector(
    treeSitterLanguage = TreeSitterCpp(),
    nodeTypeProvider = CppNodeTypes(),
    calculationExtensions = CalculationExtensions(
        ignoreNodeForComplexity = { node: TSNode, nodeType: String ->
            CppNodeTypes.shouldIgnoreAbstractFunctionInLambda(node, nodeType) ||
                CppNodeTypes.shouldIgnoreFnDeclaratorInFnDefinition(node, nodeType)
        }
    )
)
