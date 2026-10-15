package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.analysers.tools.gate.config.LevelRule
import de.maibornwolff.codecharta.analysers.tools.gate.config.MetricOverride
import de.maibornwolff.codecharta.analysers.tools.gate.config.PathOverride
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity

typealias LevelRules = Map<Severity, LevelRule>

class RuleResolver(private val config: GateConfig) {
    private val overridePatterns: List<Pair<PathPatterns, PathOverride>> =
        config.overrides.map { override -> PathPatterns(override.paths) to override }

    fun rulesFor(path: String): Map<String, LevelRules> {
        val rules = config.metrics.mapValues { (_, rule) -> rule.levels }.toMutableMap()
        overridePatterns
            .filter { (patterns, _) -> patterns.matches(path) }
            .forEach { (_, override) -> override.metrics.forEach { (metric, change) -> applyOverride(rules, metric, change) } }
        return rules.filterValues { it.isNotEmpty() }
    }

    private fun applyOverride(rules: MutableMap<String, LevelRules>, metric: String, change: MetricOverride) {
        when (change) {
            MetricOverride.Off -> rules.remove(metric)
            is MetricOverride.Levels -> rules[metric] = change.applyTo(rules[metric] ?: emptyMap())
        }
    }
}
