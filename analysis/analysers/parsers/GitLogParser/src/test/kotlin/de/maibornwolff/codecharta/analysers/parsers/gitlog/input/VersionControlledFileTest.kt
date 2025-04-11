package de.maibornwolff.codecharta.analysers.parsers.gitlog.input

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.Metric
import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.MetricsFactory
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime

class VersionControlledFileTest {
    @Test
    fun versionControlledFileHoldsInitiallyOnlyTheFilename() { // given
        val metricsFactory = mockk<MetricsFactory>(relaxed = true)
        val filename = "filename"

        // when
        val versionControlledFile = VersionControlledFile(filename, metricsFactory)

        // then
        assertThat(versionControlledFile.filename).isEqualTo(filename)
        assertThat(versionControlledFile.authors).isEmpty()
    }

    @Test
    fun canRegisterMetricsByMetricsFactory() { // given
        val metricName = "metric"
        val metric = mockk<Metric>()
        every { metric.metricName() } returns metricName
        every { metric.value() } returns 1

        val metricsFactory = mockk<MetricsFactory>()
        every { metricsFactory.createMetrics() } returns listOf(metric)

        val versionControlledFile =
            VersionControlledFile(
                "filename",
                metricsFactory
            )

        // when
        val metricsMap = versionControlledFile.metricsMap

        // then
        assertThat(metricsMap).hasSize(1)
        assertThat(versionControlledFile.getMetricValue(metricName)).isEqualTo(1)
    }

    @Test
    fun canRegisterASimpleCommit() { // given
        val modificationMetric = mockk<Metric>(relaxed = true)

        val filename = "filename"
        val author = "An Author"
        val versionControlledFile =
            VersionControlledFile(
                filename,
                listOf(modificationMetric)
            )

        // when
        val modification = Modification(filename)
        val commit = createCommit(author, modification)
        versionControlledFile.registerCommit(commit, modification)

        // then
        assertThat(versionControlledFile.filename).isEqualTo(filename)
        assertThat(versionControlledFile.authors).containsExactly(author)

        verify(exactly = 1) { modificationMetric.registerModification(any()) }
        verify(exactly = 1) { modificationMetric.registerModification(modification) }
    }

    private fun createCommit(author: String, modification: Modification): Commit {
        return Commit(author, listOf(modification), OffsetDateTime.now())
    }
}
