package de.maibornwolff.codecharta.analysers.parsers.unified.codesmells

import de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors.TreeSitterLibraryCollector
import de.maibornwolff.treesitter.excavationsite.api.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.api.Language
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.io.File

class CommentRatioTest {
    private val collector = TreeSitterLibraryCollector(Language.JAVA)

    private fun createTestFile(content: String): File {
        val tempFile = File.createTempFile("testFile", ".java")
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should calculate comment ratio correctly`() {
        // Arrange
        val fileContent = """
            public class Example {
                // Comment 1
                // Comment 2
                public void method() {
                    int a = 1;
                    int b = 2;
                    int c = 3;
                    int d = 4;
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMMENT_RATIO.metricName]).isEqualTo(0.25)
    }

    @Test
    fun `should calculate comment ratio as 0 when rloc is 0`() {
        // Arrange
        val fileContent = """
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMMENT_RATIO.metricName]).isEqualTo(0.0)
    }

    @Test
    fun `should calculate comment ratio as 0 when there are no comments`() {
        // Arrange
        val fileContent = """
            public class Example {
                public void method() {
                    int a = 1;
                    int b = 2;
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMMENT_RATIO.metricName]).isEqualTo(0.0)
    }
}
