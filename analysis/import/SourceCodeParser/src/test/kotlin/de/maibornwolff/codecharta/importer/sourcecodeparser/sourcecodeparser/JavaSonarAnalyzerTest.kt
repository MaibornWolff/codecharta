package de.maibornwolff.codecharta.importer.sourcecodeparser.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.sonaranalyzers.JavaSonarAnalyzer
import org.junit.Test
import java.io.File
import java.util.ArrayList

import org.assertj.core.api.Assertions.assertThat
import java.io.Serializable

class JavaSonarAnalyzerTest {

    @Test
    fun metricsForMultipleFiles() {
        val path = File("src/test/resources/de/maibornwolff/codecharta/importer/sourcecodeparser/projects_for_tests/miniJavaProject/mini").toString()
        val fileList = ArrayList<String>()
        fileList.add("RealLinesShort.java")
        fileList.add("Annotation.java")

        val javaSourceCodeAnalyzer = JavaSonarAnalyzer(path)
        val metrics = javaSourceCodeAnalyzer.scanFiles(fileList)

        assertThat(metrics).containsKey("RealLinesShort.java")
        assertThat(metrics).containsKey("Annotation.java")
    }

    @Test
    fun metricsAreCorrect(){

        val path = File("src/test/resources/de/maibornwolff/codecharta/importer/sourcecodeparser/projects_for_tests/miniJavaProject/mini").toString()
        val fileList = ArrayList<String>()
        fileList.add("RealLinesShort.java")

        val javaSourceCodeAnalyzer = JavaSonarAnalyzer(path)
        val metrics = javaSourceCodeAnalyzer.scanFiles(fileList)

        assertThat(metrics["RealLinesShort.java"]?.get("ncloc")).isEqualTo(6)
        assertThat(metrics["RealLinesShort.java"]?.get("functions")).isEqualTo(1)
        assertThat(metrics["RealLinesShort.java"]?.get("statements")).isEqualTo(0)
        assertThat(metrics["RealLinesShort.java"]?.get("classes")).isEqualTo(1)
        assertThat(metrics["RealLinesShort.java"]?.get("complexity")).isEqualTo(1)
        assertThat(metrics["RealLinesShort.java"]?.get("comment_lines")).isEqualTo(0)

    }

}