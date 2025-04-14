package de.maibornwolff.codecharta.analysers.parsers.rawtext

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test

class ProjectMetricsTest {
    @Test
    fun `Should add metric when provided with valid input`() {
        // given
        val filePath1 = "filePath1"
        val filePath2 = "filePath2"
        val key1 = "foo"
        val key2 = "bar"
        val value1 = 1.0
        val value2 = 2.0
        val fileMetrics1 = FileMetrics()
        val fileMetrics2 = FileMetrics()
        fileMetrics1.addMetric(key1, value1.toInt())
        fileMetrics2.addMetric(key2, value2.toInt())
        val expected = mutableMapOf(filePath1 to fileMetrics1, filePath2 to fileMetrics2)

        // when
        val projectMetrics = ProjectMetrics()
        projectMetrics.addFileMetrics(filePath1, fileMetrics1)
        projectMetrics.addFileMetrics(filePath2, fileMetrics2)

        // then
        Assertions.assertThat(expected).isEqualTo(projectMetrics.metricsMap)
    }

    @Test
    fun `Should return updated metrics when metric added`() {
        // given
        val filePath1 = "filePath1"
        val key1 = "foo"
        val value1 = 1.0
        val fileMetrics1 = FileMetrics()
        fileMetrics1.addMetric(key1, value1.toInt())
        val expected = mutableMapOf(filePath1 to fileMetrics1)

        // when
        val actual = ProjectMetrics().addFileMetrics(filePath1, fileMetrics1).metricsMap

        // then
        Assertions.assertThat(expected).isEqualTo(actual)
    }
}
