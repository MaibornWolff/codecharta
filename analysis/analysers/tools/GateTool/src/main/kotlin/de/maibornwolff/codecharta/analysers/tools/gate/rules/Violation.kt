package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity

sealed interface Violation {
    val severity: Severity
    val instruction: String?
}

enum class Bound(val symbol: String, val key: String) {
    MAX(">", "max"),
    MIN("<", "min")
}

data class Limit(val bound: Bound, val value: Double)

data class MetricViolation(
    override val severity: Severity,
    override val instruction: String?,
    val path: String,
    val metric: String,
    val value: Double,
    val limit: Limit
) : Violation

data class UnknownMetric(override val severity: Severity, override val instruction: String?, val metric: String) : Violation

data class CycleViolation(override val severity: Severity, override val instruction: String?, val declarations: List<Declaration>) :
    Violation {
    val files: List<String> get() = declarations.map { it.file }.distinct().sorted()

    val isInsideOneFile: Boolean get() = files.size == 1
}

data class UpwardViolation(override val severity: Severity, override val instruction: String?, val from: Declaration, val to: Declaration) :
    Violation

data class UnmatchedPattern(override val severity: Severity, override val instruction: String?, val pattern: String, val setting: String) :
    Violation

data class StaleAcceptance(
    override val severity: Severity,
    override val instruction: String?,
    val setting: String,
    val files: List<String>
) : Violation

data class DependenciesNotChecked(override val severity: Severity, override val instruction: String?) : Violation

data class GateResult(val violations: List<Violation>, val filesChecked: Int) {
    fun count(severity: Severity): Int = violations.count { it.severity == severity }

    fun exitCode(config: GateConfig): Int = violations.maxOfOrNull { it.severity }?.let(config::exitCodeFor) ?: 0
}
