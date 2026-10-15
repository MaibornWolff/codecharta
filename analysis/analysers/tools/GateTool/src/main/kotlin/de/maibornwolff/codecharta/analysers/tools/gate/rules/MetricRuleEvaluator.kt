package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.util.EditDistance

class MetricRuleEvaluator(private val config: GateConfig) {
    private val resolver = RuleResolver(config)

    fun evaluate(files: List<AnalysedFile>): List<Violation> = files.flatMap(::evaluateFile) + unknownMetrics(files)

    private fun evaluateFile(file: AnalysedFile): List<Violation> = resolver.rulesFor(file.path).mapNotNull { (metric, levels) ->
        val value = file.metrics[metric] ?: return@mapNotNull null
        worstExceededLevel(value, levels)?.let { (severity, level) ->
            MetricViolation(severity, level.instruction, file.path, metric, value, level.max)
        }
    }

    private fun worstExceededLevel(value: Double, levels: LevelRules) = levels.entries
        .sortedByDescending { it.key }
        .firstOrNull { value > it.value.max }
        ?.toPair()

    private fun unknownMetrics(files: List<AnalysedFile>): List<Violation> {
        val measuredMetrics = files.flatMap { it.metrics.keys }.toSet()
        return config.configuredMetrics
            .filter { it !in measuredMetrics }
            .map { metric -> UnknownMetric(config.worstSeverityFor(metric), unknownMetricInstruction(metric, measuredMetrics), metric) }
    }

    private fun unknownMetricInstruction(metric: String, measuredMetrics: Set<String>): String {
        val closest = measuredMetrics.minByOrNull { EditDistance.between(it, metric) }
        val suggestion = closest?.takeIf { EditDistance.between(it, metric) <= MAX_TYPO_DISTANCE }?.let { "Did you mean '$it'? " } ?: ""
        return "The analysis produced no metric named '$metric'. ${suggestion}Check the name, or switch on the analyser that measures it."
    }

    companion object {
        private const val MAX_TYPO_DISTANCE = 2
    }
}
