package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators.CalculationExtensions
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.RubyNodeTypes
import org.treesitter.TSNode
import org.treesitter.TreeSitterRuby

class RubyCollector : MetricCollector(
    treeSitterLanguage = TreeSitterRuby(),
    nodeTypeProvider = RubyNodeTypes(),
    calculationExtensions = CalculationExtensions(
        hasFunctionBodyStartOrEndNode = false,
        ignoreNodeForComplexity = { node: TSNode, nodeType: String ->
            RubyNodeTypes.shouldIgnoreChildWithEqualParentType(node, nodeType) ||
                RubyNodeTypes.shouldIgnoreElseNotInCaseStatement(node, nodeType)
        },
        ignoreNodeForRealLinesOfCode = { _: TSNode, nodeType: String ->
            RubyNodeTypes.shouldIgnoreNodeTypeForRloc(nodeType)
        },
        ignoreNodeForParameterOfFunctions = { node: TSNode, nodeType: String ->
            RubyNodeTypes.shouldIgnoreMethodNameAsParameter(node, nodeType)
        }
    )
)
