package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.analysers.tools.gate.config.MetricOverride
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity

class MetricRuleEvaluator(private val config: GateConfig) {
    private val resolver = RuleResolver(config)

    fun evaluate(files: List<AnalysedFile>): List<Violation> = files.flatMap(::evaluateFile) + unknownMetrics(files)

    private fun evaluateFile(file: AnalysedFile): List<Violation> = resolver.rulesFor(file.path).mapNotNull { (metric, levels) ->
        val value = file.metrics[metric] ?: return@mapNotNull null
        worstExceededLevel(value, levels)?.let { (severity, level) ->
            Violation(
                ViolationKind.METRIC,
                severity,
                level.message,
                path = file.path,
                metric = metric,
                value = value,
                threshold = level.max
            )
        }
    }

    private fun worstExceededLevel(value: Double, levels: LevelRules) = levels.entries
        .sortedByDescending { it.key }
        .firstOrNull { value > it.value.max }
        ?.toPair()

    private fun unknownMetrics(files: List<AnalysedFile>): List<Violation> {
        val measuredMetrics = files.flatMap { it.metrics.keys }.toSet()
        return configuredMetrics()
            .filter { it !in measuredMetrics }
            .map { metric ->
                Violation(ViolationKind.UNKNOWN_METRIC, Severity.WARNING, unknownMetricMessage(metric), metric = metric)
            }
    }

    private fun configuredMetrics(): Set<String> {
        val overriddenMetrics = config.overrides.flatMap { override ->
            override.metrics.filterValues { it is MetricOverride.Levels }.keys
        }
        return config.metrics.keys + overriddenMetrics
    }

    private fun unknownMetricMessage(metric: String): String =
        "The analysis produced no metric named '$metric'. Check the name, or switch on the analyser that measures it."
}
