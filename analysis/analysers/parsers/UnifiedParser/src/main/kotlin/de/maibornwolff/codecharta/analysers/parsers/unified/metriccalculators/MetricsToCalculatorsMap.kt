package de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableMetrics
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.MetricNodeTypes
import org.treesitter.TSNode

class MetricsToCalculatorsMap() {
    companion object {
        fun getMetricInfo(
            nodeTypeProvider: MetricNodeTypes,
            calcExtensions: CalculationExtensions
        ): Map<AvailableMetrics, (TSNode, String, Int, Int) -> Int> {
            val complexityCalc = ComplexityCalculator(nodeTypeProvider)
            val commentCalc = CommentLinesCalculator(nodeTypeProvider)
            val numberOfFunctionsCalc = NumberOfFunctionsCalc(nodeTypeProvider)
            val realLinesOfCodeCalc = RealLinesOfCodeCalc(nodeTypeProvider)

            return mapOf(
                AvailableMetrics.COMPLEXITY to { node: TSNode, nodeType: String, _: Int, _: Int ->
                    complexityCalc.calculateFunctionComplexityForNode(
                        CalculationContext(
                            node,
                            nodeType,
                            shouldIgnoreNode = calcExtensions.ignoreNodeForComplexity
                        )
                    )
                },
                AvailableMetrics.LOGIC_COMPLEXITY to { node: TSNode, nodeType: String, _: Int, _: Int ->
                    complexityCalc.calculateMetricForNode(
                        CalculationContext(
                            node,
                            nodeType,
                            shouldIgnoreNode = calcExtensions.ignoreNodeForComplexity
                        )
                    )
                },
                AvailableMetrics.COMMENT_LINES to { node: TSNode, nodeType: String, startRow: Int, endRow: Int ->
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
                AvailableMetrics.NUMBER_OF_FUNCTIONS to { node: TSNode, nodeType: String, _: Int, _: Int ->
                    numberOfFunctionsCalc.calculateMetricForNode(
                        CalculationContext(
                            node,
                            nodeType,
                            shouldIgnoreNode = calcExtensions.ignoreNodeForNumberOfFunctions
                        )
                    )
                },
                AvailableMetrics.REAL_LINES_OF_CODE to { node: TSNode, nodeType: String, startRow: Int, endRow: Int ->
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
    }
}
