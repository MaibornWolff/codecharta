package de.maibornwolff.codecharta.analysers.parsers.unified.codesmells

import de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors.JavaCollector
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableFileMetrics
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.io.File

class ExcessiveCommentsTest {
    private val collector = JavaCollector()

    private fun createTestFile(content: String): File {
        val tempFile = File.createTempFile("testFile", ".java")
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should detect excessive comments when file has more than 10 comment lines`() {
        // Arrange
        val fileContent = """
            public class Example {
                // Comment 1
                // Comment 2
                // Comment 3
                // Comment 4
                // Comment 5
                // Comment 6
                // Comment 7
                // Comment 8
                // Comment 9
                // Comment 10
                // Comment 11
                public void method() {
                    int a = 1;
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.EXCESSIVE_COMMENTS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should not detect excessive comments when file has exactly 10 comment lines`() {
        // Arrange
        val fileContent = """
            public class Example {
                // Comment 1
                // Comment 2
                // Comment 3
                // Comment 4
                // Comment 5
                // Comment 6
                // Comment 7
                // Comment 8
                // Comment 9
                // Comment 10
                public void method() {
                    int a = 1;
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.EXCESSIVE_COMMENTS.metricName]).isEqualTo(0.0)
    }

    @Test
    fun `should not detect excessive comments when file has fewer than 10 comment lines`() {
        // Arrange
        val fileContent = """
            public class Example {
                // Comment 1
                // Comment 2
                public void method() {
                    int a = 1;
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.EXCESSIVE_COMMENTS.metricName]).isEqualTo(0.0)
    }
}
