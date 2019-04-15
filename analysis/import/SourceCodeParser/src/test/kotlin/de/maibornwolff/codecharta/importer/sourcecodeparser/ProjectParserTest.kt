package de.maibornwolff.codecharta.importer.sourcecodeparser

import com.nhaarman.mockito_kotlin.any
import com.nhaarman.mockito_kotlin.mock
import com.nhaarman.mockito_kotlin.whenever
import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.ProjectMetrics
import de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters.CSVMetricWriter
import de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters.CSVMetricWriterTest
import de.maibornwolff.codecharta.importer.sourcecodeparser.sonaranalyzers.JavaSonarAnalyzer
import de.maibornwolff.codecharta.importer.sourcecodeparser.sonaranalyzers.SonarAnalyzer
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.File
import java.lang.reflect.Field

class ProjectParserTest{

    // TODO: Maybe mock result from SonarAnalyzers.
    // Once more than Sonar Java these tests should be adjusted to make sure results from multiple parsers are
    // combined correctly

    //private fun mockResponse(): ProjectMetrics{
    //    return ProjectMetrics().addFile("foo.java").addFile("bar/foo.java").addFile("bar/hello.java")
    //}


    @Test
    fun `paths and file names are correct`() {
        val testProjectPath = "src/test/resources/sampleproject"

        val projectParser = ProjectParser()
        projectParser.setUpAnalyzers()
        // val sonarAnalyzers = projectParser.javaClass.getDeclaredField("sonarAnalyzers") as Field
        // sonarAnalyzers.isAccessible = true
        // val mockAnalyzer: JavaSonarAnalyzer = mock()
        // whenever(mockAnalyzer.scanFiles(any(), any())).thenReturn(mockResponse())
        projectParser.sonarAnalyzers.add(JavaSonarAnalyzer())
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
        projectParser.setUpAnalyzers()
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
        projectParser.setUpAnalyzers()
        projectParser.scanProject(File(testProjectPath).absoluteFile)

        val projectMetricsMap = projectParser.projectMetrics.projectMetrics
        assertThat(projectMetricsMap).doesNotContainKey("foo.py")
    }

    @Test
    fun `file metrics are correct`() {
        val testProjectPath = "src/test/resources/sampleproject"

        val projectParser = ProjectParser()
        projectParser.setUpAnalyzers()
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
        projectParser.setUpAnalyzers()
        projectParser.scanProject(File(testProjectPath).absoluteFile)

        assertThat(projectParser.metricKinds.toString()).contains("functions", "complexity", "ncloc", "classes")
    }

}