package de.maibornwolff.codecharta.importer.scmlogparser.input

import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.Metric
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import org.junit.jupiter.api.Assertions
import java.time.OffsetDateTime
import java.util.* // ktlint-disable no-wildcard-imports

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
        assertThat(versionControlledFile.actualFilename).isEqualTo(filename)
        assertThat(versionControlledFile.authors).isEmpty()
        assertThat(versionControlledFile.markedDeleted()).isFalse()
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
            versionControlledFile.registerCommit(commit)
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
        versionControlledFile.registerCommit(commit)
        // then
        assertThat(versionControlledFile.filename).isEqualTo(filename)
        assertThat(versionControlledFile.actualFilename).isEqualTo(filename)
        assertThat(versionControlledFile.authors).containsExactly(author)
        assertThat(versionControlledFile.markedDeleted()).isFalse()

        verify(exactly = 1) { modificationMetric.registerModification(any()) }
        verify(exactly = 1) { modificationMetric.registerModification(modification) }
    }

    @Test
    fun getAuthorsReturnsAllAuthors() {
        // given
        val filename = "filename"
        val author1 = "An Author"
        val author2 = "2nd Author"
        val versionControlledFile = VersionControlledFile(filename)
        // when
        val modification1 = Modification(filename)
        versionControlledFile.registerCommit(createCommit(author1, modification1))
        val modification2 = Modification(filename)
        versionControlledFile.registerCommit(createCommit(author2, modification2))
        val modification3 = Modification(filename)
        versionControlledFile.registerCommit(createCommit(author1, modification3))
        // then
        assertThat(versionControlledFile.filename).isEqualTo(filename)
        assertThat(versionControlledFile.authors).containsExactlyInAnyOrder(author1, author2)
    }

    @Test
    fun deletionMarksFileAsDeleted() {
        // given
        val filename = "filename"
        val versionControlledFile = VersionControlledFile(filename)
        // when
        val modifications = Arrays.asList(
            Modification(filename),
            Modification(filename, Modification.Type.DELETE),
            Modification(filename)
        )
        modifications
            .forEach { mod -> versionControlledFile.registerCommit(createCommit("An Author", mod)) }
        // then
        assertThat(versionControlledFile.filename).isEqualTo(filename)
        assertThat(versionControlledFile.actualFilename).isEqualTo(filename)
        assertThat(versionControlledFile.markedDeleted()).isTrue()
    }

    @Test
    fun renamingChangesActualFilename() {
        // given
        val modificationMetric = mockk<Metric>(relaxed = true)
        val oldFilename = "old filename"
        val filename = "filename"
        val versionControlledFile = VersionControlledFile(filename, Arrays.asList(modificationMetric))
        // when
        // anti-chronological ordering
        val modifications = Arrays.asList(
            Modification(filename),
            Modification(filename, oldFilename, Modification.Type.RENAME),
            Modification(oldFilename)
        )
        modifications
            .forEach { mod -> versionControlledFile.registerCommit(createCommit("An Author", mod)) }
        // then
        assertThat(versionControlledFile.filename).isEqualTo(oldFilename)
        assertThat(versionControlledFile.actualFilename).isEqualTo(filename)
        assertThat(versionControlledFile.markedDeleted()).isFalse()

        verify(exactly = 3) { modificationMetric.registerModification(any()) }
    }

    private fun createCommit(author: String, modification: Modification): Commit {
        return Commit(author, Arrays.asList(modification), OffsetDateTime.now())
    }
}