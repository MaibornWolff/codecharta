package de.maibornwolff.codecharta.analysers.importers.sbom.vulnerabilities

data class Rating(val severity: String, val score: Double?)

/** One rating per vulnerability, worst case first: the highest CVSS v3 score, bucketed with NVD's thresholds. */
object Severity {
    const val CRITICAL = "critical"
    const val HIGH = "high"
    const val MEDIUM = "medium"
    const val LOW = "low"
    const val UNKNOWN = "unknown"

    private const val CRITICAL_FROM = 9.0
    private const val HIGH_FROM = 7.0
    private const val MEDIUM_FROM = 4.0
    private val WORST_FIRST = listOf(CRITICAL, HIGH, MEDIUM, LOW)
    private val LABEL_SYNONYMS = mapOf("moderate" to MEDIUM, "important" to HIGH)

    /**
     * CVSS v3 scores win; without one, another non-v2 score (e.g. CVSS v4) is used, then the worst severity label.
     * CVSS v2 uses another rubric, so it never sets the bucket.
     */
    fun rate(v3Scores: List<Double>, otherScores: List<Double>, labels: List<String>): Rating {
        val score = v3Scores.maxOrNull() ?: otherScores.maxOrNull()
        if (score != null) return Rating(ofScore(score), score)
        return Rating(worstLabel(labels), null)
    }

    fun ofScore(score: Double): String = when {
        score >= CRITICAL_FROM -> CRITICAL
        score >= HIGH_FROM -> HIGH
        score >= MEDIUM_FROM -> MEDIUM
        score > 0 -> LOW
        else -> UNKNOWN
    }

    private fun worstLabel(labels: List<String>): String {
        val known = labels.map { it.lowercase() }.map { LABEL_SYNONYMS[it] ?: it }.filter { it in WORST_FIRST }
        return WORST_FIRST.firstOrNull { it in known } ?: UNKNOWN
    }
}
