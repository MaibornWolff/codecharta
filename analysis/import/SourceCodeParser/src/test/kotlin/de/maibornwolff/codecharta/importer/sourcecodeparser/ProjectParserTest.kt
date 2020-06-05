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

    private fun addMockAnalyzerToProjectParser(projectParser: ProjectParser) {
        val sonarAnalyzers = projectParser.javaClass.getDeclaredField("sonarAnalyzers") as Field
        sonarAnalyzers.isAccessible = true

        val mockAnalyzerJava: SonarAnalyzer = mock()
        whenever(mockAnalyzerJava.scanFiles(any(), any())).thenReturn(createmMockResponseJava())
        whenever(mockAnalyzerJava.FILE_EXTENSION).thenReturn("java")
        projectParser.sonarAnalyzers.add(mockAnalyzerJava)

        val mockAnalyzerPython: SonarAnalyzer = mock()
        whenever(mockAnalyzerPython.scanFiles(any(), any())).thenReturn(createmMockResponsePython())
        whenever(mockAnalyzerPython.FILE_EXTENSION).thenReturn("py")
        projectParser.sonarAnalyzers.add(mockAnalyzerPython)
    }

    private fun createmMockResponseJava(): ProjectMetrics{
        val result = ProjectMetrics().addFile("foo.java").addFile("bar/foo.java")
        result.addMetricToFile("foo.java", "functions", 4)
        result.addMetricToFile("bar/foo.java", "functions", 7)
        result.addMetricToFile("foo.java", "ncloc", 31)
        result.addMetricToFile("bar/foo.java", "ncloc", 44)
        return result
    }

    private fun createmMockResponsePython(): ProjectMetrics{
        val result = ProjectMetrics().addFile("foo.py")
        result.addMetricToFile("foo.py", "something_else", 42)
        return result
    }


    @Test
    fun `paths and file names are correct`() {
        val testProjectPath = "src/test/resources/sampleproject"

        val projectParser = ProjectParser()
        addMockAnalyzerToProjectParser(projectParser)
        projectParser.scanProject(File(testProjectPath).absoluteFile)

        val projectMetricsMap = projectParser.projectMetrics.projectMetrics
        assertThat(projectMetricsMap).containsKey("foo.java")
        assertThat(projectMetricsMap).containsKey("bar/foo.java")
        assertThat(projectMetricsMap).containsKey("foo.py")
    }

    @Test
    fun `file metrics are added`() {
        val testProjectPath = "src/test/resources/sampleproject"

        val projectParser = ProjectParser()
        addMockAnalyzerToProjectParser(projectParser)
        projectParser.scanProject(File(testProjectPath).absoluteFile)

        val projectMetricsMap = projectParser.projectMetrics.projectMetrics
        assertThat(projectMetricsMap["foo.java"]!!.fileMetrics).containsKeys("functions", "ncloc")
        assertThat(projectMetricsMap["bar/foo.java"]!!.fileMetrics).containsKeys("functions", "ncloc")
        assertThat(projectMetricsMap["foo.py"]!!.fileMetrics).containsKeys("something_else")
    }

    @Test
    fun `files that were not analyzed are not added`() {
        val testProjectPath = "src/test/resources/sampleproject"

        val projectParser = ProjectParser()
        addMockAnalyzerToProjectParser(projectParser)
        projectParser.scanProject(File(testProjectPath).absoluteFile)

        val projectMetricsMap = projectParser.projectMetrics.projectMetrics
        assertThat(projectMetricsMap).doesNotContainKey("bar/something.strange")
    }

    @Test
    fun `file metrics are correct`() {
        val testProjectPath = "src/test/resources/sampleproject"

        val projectParser = ProjectParser()
        addMockAnalyzerToProjectParser(projectParser)
        projectParser.scanProject(File(testProjectPath).absoluteFile)

        val fooMetrics = projectParser.projectMetrics.projectMetrics["foo.java"]!!.fileMetrics
        val barFooMetrics = projectParser.projectMetrics.projectMetrics["bar/foo.java"]!!.fileMetrics
        val fooPyMetrics = projectParser.projectMetrics.projectMetrics["foo.py"]!!.fileMetrics
        assertThat(fooMetrics["functions"]).isEqualTo(4)
        assertThat(barFooMetrics["functions"]).isEqualTo(7)

        assertThat(fooMetrics["ncloc"]).isEqualTo(31)
        assertThat(barFooMetrics["ncloc"]).isEqualTo(44)

        assertThat(fooPyMetrics["something_else"]).isEqualTo(42)
    }

    @Test
    fun `project metric set is correct`() {
        val testProjectPath = "src/test/resources/sampleproject"

        val projectParser = ProjectParser()
        addMockAnalyzerToProjectParser(projectParser)
        projectParser.scanProject(File(testProjectPath).absoluteFile)

        assertThat(projectParser.metricKinds.toString()).contains("functions", "ncloc", "something_else")
    }

}