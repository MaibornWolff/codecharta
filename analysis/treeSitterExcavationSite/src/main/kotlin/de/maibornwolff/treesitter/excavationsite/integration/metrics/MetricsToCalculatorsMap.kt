package de.maibornwolff.treesitter.excavationsite.integration.metrics

import de.maibornwolff.treesitter.excavationsite.integration.metrics.calculators.CommentLinesCalc
import de.maibornwolff.treesitter.excavationsite.integration.metrics.calculators.ComplexityCalc
import de.maibornwolff.treesitter.excavationsite.integration.metrics.calculators.MessageChainsCalc
import de.maibornwolff.treesitter.excavationsite.integration.metrics.calculators.NodeCountCalc
import de.maibornwolff.treesitter.excavationsite.integration.metrics.calculators.ParametersPerFunctionCalc
import de.maibornwolff.treesitter.excavationsite.integration.metrics.calculators.RealLinesOfCodeCalc
import de.maibornwolff.treesitter.excavationsite.integration.metrics.domain.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.integration.metrics.domain.CalculationContext
import de.maibornwolff.treesitter.excavationsite.integration.metrics.ports.MetricNodeTypes
import de.maibornwolff.treesitter.excavationsite.shared.domain.CalculationExtensions
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeNodeTypes

class MetricsToCalculatorsMap(nodeTypeProvider: MetricNodeTypes, val calcExtensions: CalculationExtensions) {
    val complexityCalc = ComplexityCalc(nodeTypeProvider)
    val commentCalc = CommentLinesCalc(nodeTypeProvider)
    val numberOfFunctionsCalc = NodeCountCalc(nodeTypeProvider.numberOfFunctionsNodeTypes)
    val realLinesOfCodeCalc = RealLinesOfCodeCalc(nodeTypeProvider)
    val messageChainsCalc = MessageChainsCalc(nodeTypeProvider)

    val parametersPerFunctionCalc = ParametersPerFunctionCalc(nodeTypeProvider)

    private val nodeCountCalcs = AvailableFileMetrics.NODE_COUNTS.associateWith { fileMetric ->
        NodeCountCalc(nodeTypeProvider.countedNodeTypes[fileMetric] ?: TreeNodeTypes(emptySet()))
    }

    fun getPerFileMetricInfo(): Map<AvailableFileMetrics, (SyntaxNode, String, Int, Int) -> Int> =
        codeMetricCalculators() + nodeCountCalculators()

    private fun nodeCountCalculators(): Map<AvailableFileMetrics, (SyntaxNode, String, Int, Int) -> Int> =
        nodeCountCalcs.mapValues { (_, calc) ->
            { node: SyntaxNode, nodeType: String, _: Int, _: Int ->
                calc.calculateMetricForNode(CalculationContext(node, nodeType, shouldIgnoreNode = { _, _ -> false }))
            }
        }

    private fun codeMetricCalculators(): Map<AvailableFileMetrics, (SyntaxNode, String, Int, Int) -> Int> = mapOf(
        AvailableFileMetrics.COMPLEXITY to { node: SyntaxNode, nodeType: String, startRow: Int, endRow: Int ->
            complexityCalc.calculateFunctionComplexityForNode(
                CalculationContext(
                    node,
                    nodeType,
                    startRow,
                    endRow,
                    shouldIgnoreNode = calcExtensions.ignoreNodeForComplexity
                )
            )
        },
        AvailableFileMetrics.LOGIC_COMPLEXITY to { node: SyntaxNode, nodeType: String, _: Int, _: Int ->
            complexityCalc.calculateMetricForNode(
                CalculationContext(
                    node,
                    nodeType,
                    shouldIgnoreNode = calcExtensions.ignoreNodeForComplexity
                )
            )
        },
        AvailableFileMetrics.COMMENT_LINES to { node: SyntaxNode, nodeType: String, startRow: Int, endRow: Int ->
            commentCalc.calculateMetricForNode(
                CalculationContext(
                    node,
                    nodeType,
                    startRow,
                    endRow,
                    calcExtensions.ignoreNodeForCommentLines
                )
            )
        },
        AvailableFileMetrics.NUMBER_OF_FUNCTIONS to { node: SyntaxNode, nodeType: String, _: Int, _: Int ->
            numberOfFunctionsCalc.calculateMetricForNode(
                CalculationContext(
                    node,
                    nodeType,
                    shouldIgnoreNode = calcExtensions.ignoreNodeForNumberOfFunctions
                )
            )
        },
        AvailableFileMetrics.MESSAGE_CHAINS to { node: SyntaxNode, nodeType: String, _: Int, _: Int ->
            messageChainsCalc.calculateMetricForNode(
                CalculationContext(
                    node,
                    nodeType,
                    shouldIgnoreNode = calcExtensions.ignoreNodeForMessageChainCall
                )
            )
        },
        AvailableFileMetrics.REAL_LINES_OF_CODE to { node: SyntaxNode, nodeType: String, startRow: Int, endRow: Int ->
            realLinesOfCodeCalc.calculateMetricForNode(
                CalculationContext(
                    node,
                    nodeType,
                    startRow,
                    endRow,
                    calcExtensions.ignoreNodeForRealLinesOfCode,
                    calcExtensions.countNodeAsLeafNode,
                    calcExtensions.hasFunctionBodyStartOrEndNode
                )
            )
        }
    )

    fun processPerFunctionMetricsForNode(node: SyntaxNode, nodeType: String, startRow: Int, endRow: Int) {
        parametersPerFunctionCalc.processMetricForNode(
            CalculationContext(
                node,
                nodeType,
                startRow,
                endRow,
                calcExtensions.ignoreNodeForParameterOfFunctions
            )
        )
    }

    fun getMeasuresOfPerFunctionMetrics(): Map<String, Double> {
        val metricNameToValue = mutableMapOf<String, Double>()
        metricNameToValue.putAll(parametersPerFunctionCalc.getMeasureMetricsForMetricType())
        metricNameToValue.putAll(complexityCalc.getMeasureMetricsForMetricType())
        metricNameToValue.putAll(realLinesOfCodeCalc.getMeasureMetricsForMetricType())

        return metricNameToValue
    }
}
