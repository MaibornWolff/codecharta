package de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableFileMetrics
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.MetricNodeTypes
import org.treesitter.TSNode

class MetricsToCalculatorsMap(
    nodeTypeProvider: MetricNodeTypes,
    val calcExtensions: CalculationExtensions
) {
    val complexityCalc = ComplexityCalc(nodeTypeProvider)
    val commentCalc = CommentLinesCalc(nodeTypeProvider)
    val numberOfFunctionsCalc = NumberOfFunctionsCalc(nodeTypeProvider)
    val realLinesOfCodeCalc = RealLinesOfCodeCalc(nodeTypeProvider)

    val parametersPerFunctionCalc = ParametersPerFunctionCalc(nodeTypeProvider)

    fun getPerFileMetricInfo(): Map<AvailableFileMetrics, (TSNode, String, Int, Int) -> Int> {
        return mapOf(
            AvailableFileMetrics.COMPLEXITY to { node: TSNode, nodeType: String, startRow: Int, endRow: Int ->
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
            AvailableFileMetrics.LOGIC_COMPLEXITY to { node: TSNode, nodeType: String, _: Int, _: Int ->
                complexityCalc.calculateMetricForNode(
                    CalculationContext(
                        node,
                        nodeType,
                        shouldIgnoreNode = calcExtensions.ignoreNodeForComplexity
                    )
                )
            },
            AvailableFileMetrics.COMMENT_LINES to { node: TSNode, nodeType: String, startRow: Int, endRow: Int ->
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
            AvailableFileMetrics.NUMBER_OF_FUNCTIONS to { node: TSNode, nodeType: String, _: Int, _: Int ->
                numberOfFunctionsCalc.calculateMetricForNode(
                    CalculationContext(
                        node,
                        nodeType,
                        shouldIgnoreNode = calcExtensions.ignoreNodeForNumberOfFunctions
                    )
                )
            },
            AvailableFileMetrics.REAL_LINES_OF_CODE to { node: TSNode, nodeType: String, startRow: Int, endRow: Int ->
                realLinesOfCodeCalc.calculateMetricForNode(
                    CalculationContext(
                        node,
                        nodeType,
                        startRow,
                        endRow,
                        calcExtensions.ignoreNodeForRealLinesOfCode,
                        calcExtensions.countNodeAsLeafNode
                    )
                )
            }
        )
    }

    fun processPerFunctionMetricsForNode(node: TSNode, nodeType: String, startRow: Int, endRow: Int) {
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
        metricNameToValue.putAll(realLinesOfCodeCalc.getMeasureMetricsForMetricType())
        metricNameToValue.putAll(complexityCalc.getMeasureMetricsForMetricType())

        return metricNameToValue
    }
}
