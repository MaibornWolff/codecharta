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
    fun addFile() {
        projectMetrics.addFile("foo")

        Assertions.assertThat(projectMetrics.projectMetrics["foo"]).isEqualToComparingFieldByField(FileMetricMap())
    }

    @Test
    fun addMetricToFile() {
        projectMetrics.addFile("foo")
        val expected = FileMetricMap().add("mcc", 99)

        projectMetrics.addMetricToFile("foo", "mcc", 99)

        Assertions.assertThat(projectMetrics.projectMetrics["foo"]).isEqualToComparingFieldByField(expected)
    }

    @Test
    fun addFileMetricMap() {
        val fileMetricMap = FileMetricMap().add("mcc", 99)

        projectMetrics.addFileMetricMap("foo", fileMetricMap)

        println(projectMetrics.projectMetrics["foo"])
        println(fileMetricMap)
        Assertions.assertThat(projectMetrics.projectMetrics["foo"]).isEqualTo(fileMetricMap)
    }

    @Test
    fun getFileMetricMap() {
        val fileMetricMap = FileMetricMap().add("mcc", 99)
        projectMetrics.addFileMetricMap("foo", fileMetricMap)

        Assertions.assertThat(projectMetrics.getFileMetricMap("foo")).isEqualTo(fileMetricMap)
    }
}