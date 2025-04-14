package de.maibornwolff.codecharta.analysers.parsers.rawtext

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test

class FileMetricsTest {
    @Test
    fun `Should add file metric when provided with valid input`() {
        // given
        val key1 = "foo"
        val key2 = "bar"
        val value1 = 1.0
        val value2 = 2.0
        val expected = mutableMapOf(key1 to value1, key2 to value2)

        // when
        val fileMetric = FileMetrics()
        fileMetric.addMetric(key1, value1.toInt())
        fileMetric.addMetric(key2, value2.toInt())

        // then
        Assertions.assertThat(expected).isEqualTo(fileMetric.metricsMap)
    }

    @Test
    fun `Should return updated metrics when metric added`() {
        // given
        val key1 = "foo"
        val value1 = 1.0
        val expected = mutableMapOf(key1 to value1)

        // when
        val fileMetric = FileMetrics()
        val actual = fileMetric.addMetric(key1, value1.toInt()).metricsMap

        // then
        Assertions.assertThat(expected).isEqualTo(actual)
    }
}
