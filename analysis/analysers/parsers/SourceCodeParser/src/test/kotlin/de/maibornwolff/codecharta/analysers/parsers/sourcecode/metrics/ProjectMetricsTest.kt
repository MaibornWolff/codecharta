package de.maibornwolff.codecharta.analysers.parsers.sourcecode.metrics

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class ProjectMetricsTest {
    private lateinit var projectMetrics: ProjectMetrics

    @BeforeEach
    fun initProjectMetrics() {
        projectMetrics = ProjectMetrics()
    }

    @Test
    fun `addFile adds a file with empty Metric Map`() {
        addFileInProject(projectMetrics, "foo")

        Assertions.assertThat(projectMetrics.projectMetrics["foo"]!!.fileMetrics).isEqualTo(FileMetricMap().fileMetrics)
    }

    @Test
    fun `AddMetricToFile adds correct metric to given file`() {
        addFileInProject(projectMetrics, "foo")
        val expected = FileMetricMap().add("mcc", 99)

        addMetricToFileInProject(projectMetrics, "foo", "mcc", 99)

        Assertions.assertThat(projectMetrics.projectMetrics["foo"]!!.fileMetrics).isEqualTo(expected.fileMetrics)
    }

    @Test
    fun `addFileMetricMap adds the Metric map under correct filename to projectMetrics`() {
        val fileMetricMap = FileMetricMap().add("mcc", 99)

        projectMetrics.addFileMetricMap("foo", fileMetricMap)

        Assertions.assertThat(projectMetrics.projectMetrics["foo"]!!).isEqualTo(fileMetricMap)
    }

    @Test
    fun `getFile MetricMap gets the metricMap for given file`() {
        val fileMetricMap = FileMetricMap().add("mcc", 99)
        projectMetrics.addFileMetricMap("foo", fileMetricMap)

        Assertions.assertThat(projectMetrics.getFileMetricMap("foo")!!).isEqualTo(fileMetricMap)
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

    private fun addFileInProject(currentProject: ProjectMetrics, file: String) {
        currentProject.projectMetrics[file] = FileMetricMap()
    }

    private fun addMetricToFileInProject(currentProject: ProjectMetrics, file: String, metric: String, value: Int) {
        currentProject.projectMetrics[file]?.add(metric, value)
    }
}
