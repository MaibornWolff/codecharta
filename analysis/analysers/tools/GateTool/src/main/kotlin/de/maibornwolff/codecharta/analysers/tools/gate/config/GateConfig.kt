package de.maibornwolff.codecharta.analysers.tools.gate.config

enum class Severity(val key: String) {
    WARNING("warning"),
    ERROR("error");

    companion object {
        fun ofKey(key: String): Severity? = entries.find { it.key == key }
    }
}

data class LevelRule(val max: Double, val message: String? = null)

data class MetricRule(val levels: Map<Severity, LevelRule>)

data class LevelOverride(val max: Double? = null, val message: String? = null)

sealed interface MetricOverride {
    data object Off : MetricOverride

    data class Levels(val levels: Map<Severity, LevelOverride>) : MetricOverride
}

data class PathOverride(val paths: List<String>, val metrics: Map<String, MetricOverride>)

data class CycleRule(val severity: Severity, val message: String? = null)

data class CycleRules(val file: CycleRule? = null, val packages: CycleRule? = null, val allowed: List<Set<String>> = emptyList())

data class GateConfig(
    val output: String = DEFAULT_OUTPUT,
    val analysers: Map<String, Boolean> = emptyMap(),
    val exitCodes: Map<Severity, Int> = DEFAULT_EXIT_CODES,
    val metrics: Map<String, MetricRule> = emptyMap(),
    val cycles: CycleRules = CycleRules(),
    val overrides: List<PathOverride> = emptyList()
) {
    val hasActiveRules: Boolean
        get() = metrics.isNotEmpty() || cycles.file != null || cycles.packages != null || overrides.any { it.metrics.isNotEmpty() }

    val configuredMetrics: List<String>
        get() {
            val overriddenMetrics = overrides.flatMap { override -> override.metrics.filterValues { it is MetricOverride.Levels }.keys }
            return (metrics.keys + overriddenMetrics).distinct()
        }

    fun isAnalyserEnabled(analyserName: String): Boolean = analysers[analyserName] ?: true

    fun exitCodeFor(severity: Severity): Int = exitCodes[severity] ?: DEFAULT_EXIT_CODES.getValue(severity)

    companion object {
        const val FILE_NAME = ".codecharta.yml"
        const val DEFAULT_OUTPUT = ".codecharta-gate-output"
        const val TOOL_FAILURE_EXIT_CODE = 2
        val DEFAULT_EXIT_CODES = mapOf(Severity.ERROR to 1, Severity.WARNING to 0)
    }
}
