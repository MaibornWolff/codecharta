package de.maibornwolff.codecharta.analysers.importers.sbom.versions

import java.time.LocalDate
import java.time.temporal.ChronoUnit
import kotlin.math.roundToLong

data class PublishedVersion(val version: String, val publishedAt: LocalDate?)

data class Lag(val newestVersion: String, val newerVersions: Int, val daysOutdated: Int?, val libyears: Double?)

/**
 * How far a used version is behind: the stable versions above it, the days since the first of them was released
 * (how long an update has been waiting) and the libyears from the used to the newest release.
 */
object VersionLag {
    private const val DAYS_PER_YEAR = 365.25
    private const val HUNDREDTHS = 100.0

    fun of(current: String, ecosystem: String?, published: List<PublishedVersion>, lookupDate: LocalDate): Lag {
        val newer = published
            .filter { StableVersions.isStable(it.version, ecosystem) && VersionOrder.compare(it.version, current) > 0 }
            .sortedWith(compareBy(VersionOrder) { it.version })
        if (newer.isEmpty()) return Lag(current, 0, 0, 0.0)
        val newest = newer.last()
        val firstNewerRelease = newer.mapNotNull { it.publishedAt }.minOrNull()
        val currentRelease = published.firstOrNull { it.version == current }?.publishedAt
        return Lag(
            newestVersion = newest.version,
            newerVersions = newer.size,
            daysOutdated = firstNewerRelease?.let { ChronoUnit.DAYS.between(it, lookupDate).coerceAtLeast(0).toInt() },
            libyears = yearsBetween(currentRelease, newest.publishedAt)
        )
    }

    private fun yearsBetween(from: LocalDate?, to: LocalDate?): Double? {
        if (from == null || to == null) return null
        val years = ChronoUnit.DAYS.between(from, to).coerceAtLeast(0) / DAYS_PER_YEAR
        return (years * HUNDREDTHS).roundToLong() / HUNDREDTHS
    }
}
