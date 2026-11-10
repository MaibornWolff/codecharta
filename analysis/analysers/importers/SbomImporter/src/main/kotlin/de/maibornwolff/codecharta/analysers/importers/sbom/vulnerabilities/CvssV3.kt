package de.maibornwolff.codecharta.analysers.importers.sbom.vulnerabilities

import kotlin.math.floor
import kotlin.math.min
import kotlin.math.pow
import kotlin.math.roundToLong

/** The CVSS 3.0/3.1 base score of a vector such as `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H`. */
object CvssV3 {
    private const val PREFIX = "CVSS:3."
    private const val MAX_SCORE = 10.0
    private const val UNCHANGED_IMPACT_FACTOR = 6.42
    private const val CHANGED_IMPACT_FACTOR = 7.52
    private const val CHANGED_IMPACT_OFFSET = 0.029
    private const val CHANGED_IMPACT_PENALTY = 3.25
    private const val CHANGED_IMPACT_PENALTY_OFFSET = 0.02
    private const val CHANGED_IMPACT_PENALTY_EXPONENT = 15.0
    private const val CHANGED_SCOPE_FACTOR = 1.08
    private const val EXPLOITABILITY_FACTOR = 8.22
    private const val ROUNDING_PRECISION = 100_000L
    private const val ROUNDING_STEP = 10_000L

    private val ATTACK_VECTOR = mapOf("N" to 0.85, "A" to 0.62, "L" to 0.55, "P" to 0.2)
    private val ATTACK_COMPLEXITY = mapOf("L" to 0.77, "H" to 0.44)
    private val PRIVILEGES_UNCHANGED = mapOf("N" to 0.85, "L" to 0.62, "H" to 0.27)
    private val PRIVILEGES_CHANGED = mapOf("N" to 0.85, "L" to 0.68, "H" to 0.5)
    private val USER_INTERACTION = mapOf("N" to 0.85, "R" to 0.62)
    private val IMPACT = mapOf("H" to 0.56, "L" to 0.22, "N" to 0.0)

    fun isV3(vector: String?): Boolean = vector?.startsWith(PREFIX) == true

    fun baseScore(vector: String): Double? {
        if (!isV3(vector)) return null
        val metrics = vector.split('/').drop(1).mapNotNull { it.split(':').takeIf { pair -> pair.size == 2 } }.associate { it[0] to it[1] }
        return runCatching { scoreOf(metrics) }.getOrNull()
    }

    private fun scoreOf(metrics: Map<String, String>): Double {
        val isScopeChanged = metrics.getValue("S") == "C"
        val impact = impactOf(metrics, isScopeChanged)
        if (impact <= 0) return 0.0
        val privileges = (if (isScopeChanged) PRIVILEGES_CHANGED else PRIVILEGES_UNCHANGED).getValue(metrics.getValue("PR"))
        val exploitability = EXPLOITABILITY_FACTOR * ATTACK_VECTOR.getValue(metrics.getValue("AV")) *
            ATTACK_COMPLEXITY.getValue(metrics.getValue("AC")) * privileges * USER_INTERACTION.getValue(metrics.getValue("UI"))
        val combined = if (isScopeChanged) CHANGED_SCOPE_FACTOR * (impact + exploitability) else impact + exploitability
        return roundUp(min(combined, MAX_SCORE))
    }

    private fun impactOf(metrics: Map<String, String>, isScopeChanged: Boolean): Double {
        val baseImpact = 1 - listOf("C", "I", "A").map { 1 - IMPACT.getValue(metrics.getValue(it)) }.reduce(Double::times)
        if (!isScopeChanged) return UNCHANGED_IMPACT_FACTOR * baseImpact
        return CHANGED_IMPACT_FACTOR * (baseImpact - CHANGED_IMPACT_OFFSET) -
            CHANGED_IMPACT_PENALTY * (baseImpact - CHANGED_IMPACT_PENALTY_OFFSET).pow(CHANGED_IMPACT_PENALTY_EXPONENT)
    }

    // The round-up of the CVSS 3.1 specification, which avoids floating-point surprises such as 4.000000001 → 4.1
    private fun roundUp(value: Double): Double {
        val scaled = (value * ROUNDING_PRECISION).roundToLong()
        if (scaled % ROUNDING_STEP == 0L) return scaled / ROUNDING_PRECISION.toDouble()
        return (floor(scaled / ROUNDING_STEP.toDouble()) + 1) / 10.0
    }
}
