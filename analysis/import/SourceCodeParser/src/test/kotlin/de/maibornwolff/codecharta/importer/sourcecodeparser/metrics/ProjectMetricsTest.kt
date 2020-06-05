package de.maibornwolff.codecharta.importer.sourcecodeparser.metrics

import org.assertj.core.api.Assertions
import org.junit.Before
import org.junit.Test

class ProjectMetricsTest {
    lateinit var projectMetrics: ProjectMetrics

    @Before
    fun initProjectMetrics() {
        projectMetrics = ProjectMetrics()
    }

    @Test
    fun `addFile adds a file with empty Metric Map`() {
        projectMetrics.addFile("foo")

        Assertions.assertThat(projectMetrics.projectMetrics["foo"]).isEqualToComparingFieldByField(FileMetricMap())
    }

    @Test
    fun `AddMetricToFile adds correct metric to given file`() {
        projectMetrics.addFile("foo")
        val expected = FileMetricMap().add("mcc", 99)

        projectMetrics.addMetricToFile("foo", "mcc", 99)

        Assertions.assertThat(projectMetrics.projectMetrics["foo"]).isEqualToComparingFieldByField(expected)
    }

    @Test
    fun `addFileMetricMap adds the Metric map under correct filename to projectMetrics`() {
        val fileMetricMap = FileMetricMap().add("mcc", 99)

        projectMetrics.addFileMetricMap("foo", fileMetricMap)

        Assertions.assertThat(projectMetrics.projectMetrics["foo"]).isEqualTo(fileMetricMap)
    }

    @Test
    fun `getFile MetricMap gets the metricMap for given file`() {
        val fileMetricMap = FileMetricMap().add("mcc", 99)
        projectMetrics.addFileMetricMap("foo", fileMetricMap)

        Assertions.assertThat(projectMetrics.getFileMetricMap("foo")).isEqualTo(fileMetricMap)
    }

    @Test
    fun `getRandomFileName gets name of only file`() {
        val fileMetricMap = FileMetricMap()
        projectMetrics.addFileMetricMap("foo", fileMetricMap)

        Assertions.assertThat(projectMetrics.getRandomFileName()).isEqualTo("foo")
    }

    @Test
    fun `getRandomFileName gets one of the file names available`() {
        val fileMetricMap = FileMetricMap()
        projectMetrics.addFileMetricMap("foo", fileMetricMap)
        projectMetrics.addFileMetricMap("bar", fileMetricMap)
        val result = projectMetrics.getRandomFileName()

        Assertions.assertThat(listOf("foo", "bar")).contains(result)
    }
}