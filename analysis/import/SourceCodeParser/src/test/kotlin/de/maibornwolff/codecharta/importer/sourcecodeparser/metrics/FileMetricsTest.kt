package de.maibornwolff.codecharta.importer.sourcecodeparser.metrics

import org.assertj.core.api.Assertions
import org.junit.Before
import org.junit.Test

class FileMetricsTest {
    lateinit var fileMetricMap: FileMetricMap

    @Before
    fun initFileMetricMap() {
        fileMetricMap = FileMetricMap()
    }

    @Test
    fun `Add single metric`() {
        fileMetricMap.add("foo", 1)
        fileMetricMap.add("bar", 2)

        Assertions.assertThat(fileMetricMap.fileMetrics["foo"]).isEqualTo(1)
        Assertions.assertThat(fileMetricMap.fileMetrics["foo"]).isEqualTo(1)
    }

    @Test
    fun `Get single metric`() {
        fileMetricMap.add("foo", 1)
        fileMetricMap.add("bar", 2)

        Assertions.assertThat(fileMetricMap.getMetricValue("foo")).isEqualTo(1)
    }
}