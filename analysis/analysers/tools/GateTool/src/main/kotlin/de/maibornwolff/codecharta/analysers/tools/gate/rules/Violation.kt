package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity

enum class ViolationKind {
    METRIC,
    FILE_CYCLE,
    PACKAGE_CYCLE,
    UNKNOWN_METRIC
}

data class Violation(
    val kind: ViolationKind,
    val severity: Severity,
    val instruction: String?,
    val path: String? = null,
    val metric: String? = null,
    val value: Double? = null,
    val threshold: Double? = null,
    val members: List<String> = emptyList(),
    val dependencies: Map<String, List<String>> = emptyMap()
)

data class GateResult(val violations: List<Violation>, val filesChecked: Int) {
    fun count(severity: Severity): Int = violations.count { it.severity == severity }

    fun exitCode(config: GateConfig): Int = violations.map { it.severity }.distinct().maxOfOrNull(config::exitCodeFor) ?: 0
}
