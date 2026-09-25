package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Result of parsing a file for metrics.
 *
 * @property metrics Map of metric names to their values
 * @property perFunctionMetrics Map of per-function metric aggregations (min, max, mean, median)
 */
data class MetricsResult(val metrics: Map<String, Double>, val perFunctionMetrics: Map<String, Double> = emptyMap()) {
    val complexity: Double get() = metrics["complexity"] ?: 0.0
    val logicComplexity: Double get() = metrics["logic_complexity"] ?: 0.0
    val commentLines: Double get() = metrics["comment_lines"] ?: 0.0
    val realLinesOfCode: Double get() = metrics["rloc"] ?: 0.0
    val linesOfCode: Double get() = metrics["loc"] ?: 0.0
    val numberOfFunctions: Double get() = metrics["number_of_functions"] ?: 0.0
    val longMethod: Double get() = metrics["long_method"] ?: 0.0
    val longParameterList: Double get() = metrics["long_parameter_list"] ?: 0.0
    val excessiveComments: Double get() = metrics["excessive_comments"] ?: 0.0
    val commentRatio: Double get() = metrics["comment_ratio"] ?: 0.0
    val messageChains: Double get() = metrics["message_chains"] ?: 0.0
}
