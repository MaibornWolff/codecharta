package de.maibornwolff.codecharta.importer.sourcecodeparser.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.sonaranalyzers.JavaSonarAnalyzer
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.File

class JavaSonarAnalyzerTest {
    private val path = File("src/test/resources/sampleproject").toString()

    @Test
    fun `single file is correctly analyzed`() {
        val fileList = ArrayList<String>()
        fileList.add("foo.java")

        val javaSourceCodeAnalyzer = JavaSonarAnalyzer()
        val metrics = javaSourceCodeAnalyzer.scanFiles(fileList, File(path))

        assertThat(metrics.projectMetrics).containsKey("foo.java")
    }

    @Test
    fun `multiple files are analyzed`() {
        val fileList = ArrayList<String>()
        fileList.add("foo.java")
        fileList.add("bar/foo.java")

        val javaSourceCodeAnalyzer = JavaSonarAnalyzer()
        val metrics = javaSourceCodeAnalyzer.scanFiles(fileList, File(path))

        assertThat(metrics.projectMetrics).containsKey("foo.java")
        assertThat(metrics.projectMetrics).containsKey("bar/foo.java")
    }

    @Test
    fun `multiple analyzed files have metrics`() {
        val fileList = ArrayList<String>()
        fileList.add("foo.java")
        fileList.add("bar/foo.java")

        val javaSourceCodeAnalyzer = JavaSonarAnalyzer()
        val metrics = javaSourceCodeAnalyzer.scanFiles(fileList, File(path))

        assertThat(metrics.getFileMetricMap("foo.java")?.fileMetrics).isNotEmpty
        assertThat(metrics.getFileMetricMap("bar/foo.java")?.fileMetrics).isNotEmpty
    }

    @Test
    fun `correct metrics are retrieved`() {
        val fileList = ArrayList<String>()
        fileList.add("foo.java")

        val javaSourceCodeAnalyzer = JavaSonarAnalyzer()
        val metrics = javaSourceCodeAnalyzer.scanFiles(fileList, File(path))

        assertThat(metrics.getFileMetricMap("foo.java")?.getMetricValue("rloc")).isEqualTo(31)
        assertThat(metrics.getFileMetricMap("foo.java")?.getMetricValue("functions")).isEqualTo(4)
        assertThat(metrics.getFileMetricMap("foo.java")?.getMetricValue("statements")).isEqualTo(13)
        assertThat(metrics.getFileMetricMap("foo.java")?.getMetricValue("classes")).isEqualTo(1)
        assertThat(metrics.getFileMetricMap("foo.java")?.getMetricValue("mcc")).isEqualTo(6)
        assertThat(metrics.getFileMetricMap("foo.java")?.getMetricValue("comment_lines")).isEqualTo(3)
        assertThat(metrics.getFileMetricMap("foo.java")?.getMetricValue("max_nesting_level")).isEqualTo(2)
    }

    @Test
    fun `sonar issues are retrieved`() {
        val path = File("src/test/resources").toString()
        val fileList = ArrayList<String>()
        fileList.add("sonar_issues_java/CodeSmell.java")

        val javaSourceCodeAnalyzer = JavaSonarAnalyzer()
        val metrics = javaSourceCodeAnalyzer.scanFiles(fileList, File(path))

        assertThat(
            metrics.getFileMetricMap("sonar_issues_java/CodeSmell.java")?.getMetricValue("code_smell")
        ).isEqualTo(1)
    }

    @Test
    fun `sonar issues are zero if nothing is found`() {
        val path = File("src/test/resources/sonar_issues_java").toString()
        val fileList = ArrayList<String>()
        fileList.add("Clean.java")

        val javaSourceCodeAnalyzer = JavaSonarAnalyzer()
        val metrics = javaSourceCodeAnalyzer.scanFiles(fileList, File(path))

        assertThat(metrics.getFileMetricMap("Clean.java")?.getMetricValue("code_smell")).isEqualTo(0)
        assertThat(metrics.getFileMetricMap("Clean.java")?.getMetricValue("security_hotspot")).isEqualTo(0)
        assertThat(metrics.getFileMetricMap("Clean.java")?.getMetricValue("bug")).isEqualTo(0)
    }

    @Test
    fun `commented out blocks of code is zero if issue is not found`() {
        val path = File("src/test/resources/sonar_issues_java").toString()
        val fileList = ArrayList<String>()
        fileList.add("Clean.java")

        val javaSourceCodeAnalyzer = JavaSonarAnalyzer()
        val metrics = javaSourceCodeAnalyzer.scanFiles(fileList, File(path))

        assertThat(metrics.getFileMetricMap("Clean.java")?.getMetricValue("commented_out_code_blocks")).isEqualTo(0)
    }

    @Test
    fun `commented out blocks of code are correct if issues are found`() {
        val path = File("src/test/resources/sonar_issues_java").toString()
        val fileList = ArrayList<String>()
        fileList.add("CommentedOutCode.java")

        val javaSourceCodeAnalyzer = JavaSonarAnalyzer()
        val metrics = javaSourceCodeAnalyzer.scanFiles(fileList, File(path))

        assertThat(
            metrics.getFileMetricMap("CommentedOutCode.java")?.getMetricValue(
                "commented_out_code_blocks"
            )
        ).isEqualTo(3)
    }

    @Test
    fun `java 14 code should be parsable`() {
        val fileList = ArrayList<String>()
        fileList.add("Java14.java")

        val javaSourceCodeAnalyzer = JavaSonarAnalyzer()
        val metrics = javaSourceCodeAnalyzer.scanFiles(fileList, File(path))

        assertThat(metrics.projectMetrics).containsKey("Java14.java")
        assertThat(metrics.getFileMetricMap("Java14.java")?.getMetricValue("rloc")).isEqualTo(10)
    }
}
