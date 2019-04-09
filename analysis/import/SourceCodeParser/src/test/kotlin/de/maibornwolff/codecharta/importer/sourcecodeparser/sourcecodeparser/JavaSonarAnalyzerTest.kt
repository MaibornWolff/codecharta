package de.maibornwolff.codecharta.importer.sourcecodeparser.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.sonaranalyzers.JavaSonarAnalyzer
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.File
import java.util.*

class JavaSonarAnalyzerTest {
    private val path = File("src/test/resources/de/maibornwolff/codecharta/importer/sourcecodeparser/projects_for_tests/miniJavaProject/mini").toString()

    @Test
    fun `single file is correctly analyzed`() {
        val fileList = ArrayList<String>()
        fileList.add("RealLinesShort.java")

        val javaSourceCodeAnalyzer = JavaSonarAnalyzer(path)
        val metrics = javaSourceCodeAnalyzer.scanFiles(fileList)

        assertThat(metrics).containsKey("RealLinesShort.java")
    }

    @Test
    fun `multiple files are analyzed`() {
        val fileList = ArrayList<String>()
        fileList.add("RealLinesShort.java")
        fileList.add("Annotation.java")

        val javaSourceCodeAnalyzer = JavaSonarAnalyzer(path)
        val metrics = javaSourceCodeAnalyzer.scanFiles(fileList)

        assertThat(metrics).containsKey("RealLinesShort.java")
        assertThat(metrics).containsKey("Annotation.java")
    }

    @Test
    fun `multiple analyzed files have metrics`() {
        val fileList = ArrayList<String>()
        fileList.add("RealLinesShort.java")
        fileList.add("Annotation.java")

        val javaSourceCodeAnalyzer = JavaSonarAnalyzer(path)
        val metrics = javaSourceCodeAnalyzer.scanFiles(fileList)

        assertThat(metrics["Annotation.java"]?.fileMetrics).isNotEmpty
        assertThat(metrics["RealLinesShort.java"]?.fileMetrics).isNotEmpty
    }

    @Test
    fun `correct metrics are retrieved`(){
        val fileList = ArrayList<String>()
        fileList.add("RealLinesShort.java")

        val javaSourceCodeAnalyzer = JavaSonarAnalyzer(path)
        val metrics = javaSourceCodeAnalyzer.scanFiles(fileList)

        assertThat(metrics["RealLinesShort.java"]?.getMetricValue("ncloc")).isEqualTo(6)
        assertThat(metrics["RealLinesShort.java"]?.getMetricValue("functions")).isEqualTo(1)
        assertThat(metrics["RealLinesShort.java"]?.getMetricValue("statements")).isEqualTo(0)
        assertThat(metrics["RealLinesShort.java"]?.getMetricValue("classes")).isEqualTo(1)
        assertThat(metrics["RealLinesShort.java"]?.getMetricValue("complexity")).isEqualTo(1)
        assertThat(metrics["RealLinesShort.java"]?.getMetricValue("comment_lines")).isEqualTo(0)

    }

}