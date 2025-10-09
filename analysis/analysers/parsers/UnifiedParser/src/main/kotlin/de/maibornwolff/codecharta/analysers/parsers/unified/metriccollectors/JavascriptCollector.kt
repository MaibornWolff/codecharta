package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators.CalculationExtensions
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.JavascriptNodeTypes
import org.treesitter.TSNode
import org.treesitter.TreeSitterJavascript

class JavascriptCollector : MetricCollector(
    treeSitterLanguage = TreeSitterJavascript(),
    nodeTypeProvider = JavascriptNodeTypes(),
    calculationExtensions = CalculationExtensions(
        ignoreNodeForParameterOfFunctions = { node: TSNode, nodeType: String ->
            JavascriptNodeTypes.shouldIgnoreFunctionNameAsParameter(node, nodeType)
        }
    )
)
