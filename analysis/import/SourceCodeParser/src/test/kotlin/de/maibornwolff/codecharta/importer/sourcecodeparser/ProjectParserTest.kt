package de.maibornwolff.codecharta.importer.sourcecodeparser

import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.File

class ProjectParserTest{

    // TODO: Maybe mock result from SonarAnalyzers.
    // Once more than Sonar Java these tests should be adjusted to make sure results from multiple parsers are
    // combined correctly


    @Test
    fun `paths and file names are correct`() {
        val testProjectPath = "src/test/resources/sampleproject"

        val projectParser = ProjectParser()
        projectParser.scanProject(File(testProjectPath).absoluteFile)

        val projectMetricsMap = projectParser.projectMetrics.projectMetrics
        assertThat(projectMetricsMap).containsKey("foo.java")
        assertThat(projectMetricsMap).containsKey("bar/foo.java")
        assertThat(projectMetricsMap).containsKey("bar/hello.java")
    }

    @Test
    fun `file metrics are added`() {
        val testProjectPath = "src/test/resources/sampleproject"

        val projectParser = ProjectParser()
        projectParser.scanProject(File(testProjectPath).absoluteFile)

        val projectMetricsMap = projectParser.projectMetrics.projectMetrics
        assertThat(projectMetricsMap["foo.java"]!!.fileMetrics).containsKeys("functions", "ncloc")
        assertThat(projectMetricsMap["bar/foo.java"]!!.fileMetrics).containsKeys("functions", "ncloc")
        assertThat(projectMetricsMap["bar/hello.java"]!!.fileMetrics).containsKeys("functions", "ncloc")
    }

    @Test
    fun `files that were not analyzed are not added`() {
        val testProjectPath = "src/test/resources/sampleproject"

        val projectParser = ProjectParser()
        projectParser.scanProject(File(testProjectPath).absoluteFile)

        val projectMetricsMap = projectParser.projectMetrics.projectMetrics
        assertThat(projectMetricsMap).doesNotContainKey("foo.py")
    }

    @Test
    fun `file metrics are correct`() {
        val testProjectPath = "src/test/resources/sampleproject"

        val projectParser = ProjectParser()
        projectParser.scanProject(File(testProjectPath).absoluteFile)

        val fooMetrics = projectParser.projectMetrics.projectMetrics["foo.java"]!!.fileMetrics
        val barFooMetrics = projectParser.projectMetrics.projectMetrics["bar/foo.java"]!!.fileMetrics
        val barHelloMetrics = projectParser.projectMetrics.projectMetrics["bar/hello.java"]!!.fileMetrics
        assertThat(fooMetrics["functions"]).isEqualTo(4)
        assertThat(barFooMetrics["functions"]).isEqualTo(7)
        assertThat(barHelloMetrics["functions"]).isEqualTo(1)

        assertThat(fooMetrics["ncloc"]).isEqualTo(31)
        assertThat(barFooMetrics["ncloc"]).isEqualTo(44)
        assertThat(barHelloMetrics["ncloc"]).isEqualTo(6)

    }

    @Test
    fun `project metric set is correct`() {
        val testProjectPath = "src/test/resources/sampleproject"

        val projectParser = ProjectParser()
        projectParser.scanProject(File(testProjectPath).absoluteFile)

        assertThat(projectParser.metricKinds.toString()).contains("functions", "complexity", "ncloc", "classes")
    }

}