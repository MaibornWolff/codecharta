package de.maibornwolff.codecharta.analysers.parsers.sourcecode

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import de.maibornwolff.codecharta.analysers.parsers.sourcecode.metrics.FileMetricMap
import de.maibornwolff.codecharta.analysers.parsers.sourcecode.metrics.ProjectMetrics
import de.maibornwolff.codecharta.analysers.parsers.sourcecode.sonaranalyzers.SonarAnalyzer
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.File
import java.lang.reflect.Field

class ProjectParserTest {
    private fun addMockAnalyzerToProjectParser(projectParser: ProjectParser) {
        val sonarAnalyzers = projectParser.javaClass.getDeclaredField("sonarAnalyzers") as Field
        sonarAnalyzers.isAccessible = true

        val mockAnalyzerJava: SonarAnalyzer = mock()
        whenever(mockAnalyzerJava.scanFiles(any(), any())).thenReturn(createmMockResponseJava())
        whenever(mockAnalyzerJava.fileExtension).thenReturn("java")
        projectParser.sonarAnalyzers.add(mockAnalyzerJava)

        val mockAnalyzerPython: SonarAnalyzer = mock()
        whenever(mockAnalyzerPython.scanFiles(any(), any())).thenReturn(createmMockResponsePython())
        whenever(mockAnalyzerPython.fileExtension).thenReturn("py")
        projectParser.sonarAnalyzers.add(mockAnalyzerPython)
    }

    private fun createmMockResponseJava(): ProjectMetrics {
        val result = ProjectMetrics()
        addFileInProject(result, "foo.java")
        addFileInProject(result, "bar/foo.java")
        addMetricToFileInProject(result, "foo.java", "functions", 4)
        addMetricToFileInProject(result, "bar/foo.java", "functions", 7)
        addMetricToFileInProject(result, "foo.java", "ncloc", 31)
        addMetricToFileInProject(result, "bar/foo.java", "ncloc", 44)
        return result
    }

    private fun createmMockResponsePython(): ProjectMetrics {
        val result = ProjectMetrics()
        addFileInProject(result, "foo.py")
        addMetricToFileInProject(result, "foo.py", "something_else", 42)
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

    private fun addFileInProject(currentProject: ProjectMetrics, file: String) {
        currentProject.projectMetrics[file] = FileMetricMap()
    }

    private fun addMetricToFileInProject(currentProject: ProjectMetrics, file: String, metric: String, value: Int) {
        currentProject.projectMetrics[file]?.add(metric, value)
    }
}
