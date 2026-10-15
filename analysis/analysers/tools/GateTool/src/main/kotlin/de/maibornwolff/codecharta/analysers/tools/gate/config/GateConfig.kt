package de.maibornwolff.codecharta.analysers.tools.gate.config

import java.io.File

enum class Severity(val key: String) {
    WARNING("warning"),
    ERROR("error");

    companion object {
        private const val WARNING_SHORTHAND = "warn"

        fun ofKey(key: String): Severity? = entries.find { it.key == key }

        fun parse(value: String): Severity? = value.lowercase().let { if (it == WARNING_SHORTHAND) WARNING else ofKey(it) }
    }
}

data class LevelRule(val max: Double?, val instruction: String? = null, val min: Double? = null)

data class MetricRule(val levels: Map<Severity, LevelRule>)

data class LevelOverride(val max: Double? = null, val instruction: String? = null, val min: Double? = null) {
    fun applyTo(current: LevelRule?): LevelRule? {
        val max = max ?: current?.max
        val min = min ?: current?.min
        if (max == null && min == null) return null
        return LevelRule(max, instruction ?: current?.instruction, min)
    }
}

sealed interface MetricOverride {
    data object Off : MetricOverride

    data class Levels(val levels: Map<Severity, LevelOverride>) : MetricOverride {
        fun applyTo(current: Map<Severity, LevelRule>): Map<Severity, LevelRule> = current + levels.mapNotNull { (severity, change) ->
            change.applyTo(current[severity])?.let { severity to it }
        }
    }
}

data class PathOverride(val paths: List<String>, val metrics: Map<String, MetricOverride>)

data class DependencyRule(val severity: Severity, val instruction: String? = null, val ignore: List<String> = emptyList())

data class DependencyRules(
    val cyclesBetweenFiles: DependencyRule? = null,
    val cyclesInsideFiles: DependencyRule? = null,
    val upward: DependencyRule? = null
)

data class AnalyserSetting(val enabled: Boolean, val arguments: List<String> = emptyList())

data class GateConfig(
    val input: String? = null,
    val output: String = DEFAULT_OUTPUT,
    val parallel: Boolean = false,
    val exclude: List<String> = emptyList(),
    val analysers: Map<String, AnalyserSetting> = emptyMap(),
    val exitCodes: Map<Severity, Int> = emptyMap(),
    val metrics: Map<String, MetricRule> = emptyMap(),
    val dependencies: DependencyRules = DependencyRules(),
    val overrides: List<PathOverride> = emptyList()
) {
    val hasActiveRules: Boolean
        get() = metrics.isNotEmpty() ||
            dependencies.cyclesBetweenFiles != null ||
            dependencies.cyclesInsideFiles != null ||
            dependencies.upward != null ||
            overrides.any { it.metrics.isNotEmpty() }

    val configuredMetrics: List<String>
        get() {
            val overriddenMetrics = overrides.flatMap { override -> override.metrics.filterValues { it is MetricOverride.Levels }.keys }
            return (metrics.keys + overriddenMetrics).distinct()
        }

    fun worstSeverityFor(metric: String): Severity {
        val overriddenLevels = overrides.mapNotNull { (it.metrics[metric] as? MetricOverride.Levels)?.levels?.keys }.flatten()
        val levels = metrics[metric]?.levels?.keys.orEmpty() + overriddenLevels
        return levels.maxOrNull() ?: Severity.WARNING
    }

    fun isAnalyserEnabled(analyserName: String): Boolean = analysers[analyserName]?.enabled ?: false

    fun argumentsFor(analyserName: String): List<String> = analysers[analyserName]?.arguments ?: emptyList()

    fun exitCodeFor(severity: Severity): Int = exitCodes[severity] ?: DEFAULT_EXIT_CODES.getValue(severity)

    companion object {
        const val FILE_NAME = ".codecharta.yml"
        const val DEFAULT_OUTPUT = ".codecharta-gate-output"
        const val TOOL_FAILURE_EXIT_CODE = 2
        val DEFAULT_EXIT_CODES = mapOf(Severity.ERROR to 1, Severity.WARNING to 0)

        fun resolve(folder: File, path: String): File = File(path).let { if (it.isAbsolute) it else File(folder, path) }
    }
}
