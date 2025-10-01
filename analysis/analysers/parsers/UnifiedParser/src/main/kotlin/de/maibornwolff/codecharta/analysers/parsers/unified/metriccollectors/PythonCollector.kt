package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators.CalculationExtensions
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.PythonNodeTypes
import org.treesitter.TSNode
import org.treesitter.TreeSitterPython

class PythonCollector : MetricCollector(
    treeSitterLanguage = TreeSitterPython(),
    nodeTypeProvider = PythonNodeTypes(),
    calculationExtensions = CalculationExtensions(
        hasFunctionBodyStartOrEndNode = Pair(false, false),
        ignoreNodeForRealLinesOfCode = { node: TSNode, nodeType: String ->
            PythonNodeTypes.nodeTypesToIgnore.contains(nodeType) ||
                PythonNodeTypes.shouldIgnoreStringInBlockComment(node, nodeType) ||
                PythonNodeTypes.shouldIgnoreNodeStartingWithComment(node)
        },
        ignoreNodeForParameterOfFunctions = { node: TSNode, nodeType: String ->
            PythonNodeTypes.shouldIgnoreMethodNameAsParameter(node, nodeType)
        },
        countNodeAsLeafNode = { node: TSNode ->
            node.type == "string" && node.parent.childCount != 1
        }
    )
)
