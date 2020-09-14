package de.maibornwolff.codecharta.importer.scmlogparserv2.input

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.metrics.Metric
import de.maibornwolff.codecharta.importer.scmlogparserv2.input.metrics.MetricsFactory
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import org.junit.jupiter.api.Assertions
import java.time.OffsetDateTime
import java.util.Arrays

class VersionControlledFileTest {

    @Test
    fun versionControlledFileHoldsInitallyOnlyTheFilename() {
        // given
        val metricsFactory = mockk<MetricsFactory>(relaxed = true)
        val filename = "filename"

        // when
        val versionControlledFile = VersionControlledFile(filename, metricsFactory)

        // then
        assertThat(versionControlledFile.filename).isEqualTo(filename)
        assertThat(versionControlledFile.authors).isEmpty()
    }

    @Test
    fun canRegisterMetricsByMetricsFactory() {
        // given
        val metricName = "metric"
        val metric = mockk<Metric>()
        every { metric.metricName() } returns metricName
        every { metric.value() } returns 1

        val metricsFactory = mockk<MetricsFactory>()
        every { metricsFactory.createMetrics() } returns Arrays.asList(metric)

        val versionControlledFile = VersionControlledFile(
            "filename",
            metricsFactory
        )

        // when
        val metricsMap = versionControlledFile.metricsMap

        // then
        assertThat(metricsMap).hasSize(1)
        assertThat(versionControlledFile.getMetricValue(metricName))
            .isEqualTo(1)
    }

    @Test
    fun throwsExceptionIfFileIsNotInCommit() {
        val versionControlledFile = VersionControlledFile(
            "filename",
            listOf()
        )

        val modification = Modification("anotherFilename")
        val commit = createCommit("An Author", modification)

        Assertions.assertThrows(IllegalStateException::class.java) {
            versionControlledFile.registerCommit(commit, modification)
        }
    }

    @Test
    fun canRegisterASimpleCommit() {
        // given
        val modificationMetric = mockk<Metric>(relaxed = true)

        val filename = "filename"
        val author = "An Author"
        val versionControlledFile = VersionControlledFile(
            filename,
            Arrays.asList(modificationMetric)
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
        return Commit(author, Arrays.asList(modification), OffsetDateTime.now())
    }
}
