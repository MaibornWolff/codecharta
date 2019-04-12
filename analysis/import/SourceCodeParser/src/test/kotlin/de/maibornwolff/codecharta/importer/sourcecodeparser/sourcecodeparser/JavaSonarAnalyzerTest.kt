package de.maibornwolff.codecharta.importer.sourcecodeparser.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.sonaranalyzers.JavaSonarAnalyzer
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.File
import java.util.*

class JavaSonarAnalyzerTest {
    private val path = File("src/test/resources/sampleproject").toString()

    @Test
    fun `single file is correctly analyzed`() {
        val fileList = ArrayList<String>()
        fileList.add("foo.java")

        val javaSourceCodeAnalyzer = JavaSonarAnalyzer(path)
        val metrics = javaSourceCodeAnalyzer.scanFiles(fileList)

        assertThat(metrics.projectMetrics).containsKey("foo.java")
    }

    @Test
    fun `multiple files are analyzed`() {
        val fileList = ArrayList<String>()
        fileList.add("foo.java")
        fileList.add("bar/foo.java")

        val javaSourceCodeAnalyzer = JavaSonarAnalyzer(path)
        val metrics = javaSourceCodeAnalyzer.scanFiles(fileList)

        assertThat(metrics.projectMetrics).containsKey("foo.java")
        assertThat(metrics.projectMetrics).containsKey("bar/foo.java")
    }

    @Test
    fun `multiple analyzed files have metrics`() {
        val fileList = ArrayList<String>()
        fileList.add("foo.java")
        fileList.add("bar/foo.java")

        val javaSourceCodeAnalyzer = JavaSonarAnalyzer(path)
        val metrics = javaSourceCodeAnalyzer.scanFiles(fileList)

        assertThat(metrics.getFileMetricMap("foo.java")?.fileMetrics).isNotEmpty
        assertThat(metrics.getFileMetricMap("bar/foo.java")?.fileMetrics).isNotEmpty
    }

    @Test
    fun `correct metrics are retrieved`(){
        val fileList = ArrayList<String>()
        fileList.add("foo.java")

        val javaSourceCodeAnalyzer = JavaSonarAnalyzer(path)
        val metrics = javaSourceCodeAnalyzer.scanFiles(fileList)

        assertThat(metrics.getFileMetricMap("foo.java")?.getMetricValue("ncloc")).isEqualTo(31)
        assertThat(metrics.getFileMetricMap("foo.java")?.getMetricValue("functions")).isEqualTo(4)
        assertThat(metrics.getFileMetricMap("foo.java")?.getMetricValue("statements")).isEqualTo(13)
        assertThat(metrics.getFileMetricMap("foo.java")?.getMetricValue("classes")).isEqualTo(1)
        assertThat(metrics.getFileMetricMap("foo.java")?.getMetricValue("complexity")).isEqualTo(6)
        assertThat(metrics.getFileMetricMap("foo.java")?.getMetricValue("comment_lines")).isEqualTo(3)

    }

}