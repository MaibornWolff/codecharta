package de.maibornwolff.codecharta.analysers.parsers.unified.codesmells

import de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors.TreeSitterLibraryCollector
import de.maibornwolff.treesitter.excavationsite.api.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.api.Language
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.io.File

class LongMethodTest {
    private val collector = TreeSitterLibraryCollector(Language.JAVA)

    private fun createTestFile(content: String): File {
        val tempFile = File.createTempFile("testFile", ".java")
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should detect long method when function has more than 10 rloc`() {
        // Arrange
        val fileContent = """
            public class Example {
                public void longMethod() {
                    int a = 1;
                    int b = 2;
                    int c = 3;
                    int d = 4;
                    int e = 5;
                    int f = 6;
                    int g = 7;
                    int h = 8;
                    int i = 9;
                    int j = 10;
                    int k = 11;
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.LONG_METHOD.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should not detect long method when function has exactly 10 rloc`() {
        // Arrange
        val fileContent = """
            public class Example {
                public void exactlyTenLines() {
                    int a = 1;
                    int b = 2;
                    int c = 3;
                    int d = 4;
                    int e = 5;
                    int f = 6;
                    int g = 7;
                    int h = 8;
                    int i = 9;
                    int j = 10;
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.LONG_METHOD.metricName]).isEqualTo(0.0)
    }

    @Test
    fun `should count multiple functions with long method smell`() {
        // Arrange
        val fileContent = """
            public class Example {
                public void longMethod1() {
                    int a = 1;
                    int b = 2;
                    int c = 3;
                    int d = 4;
                    int e = 5;
                    int f = 6;
                    int g = 7;
                    int h = 8;
                    int i = 9;
                    int j = 10;
                    int k = 11;
                }

                public void longMethod2() {
                    int a = 1;
                    int b = 2;
                    int c = 3;
                    int d = 4;
                    int e = 5;
                    int f = 6;
                    int g = 7;
                    int h = 8;
                    int i = 9;
                    int j = 10;
                    int k = 11;
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.LONG_METHOD.metricName]).isEqualTo(2.0)
    }

    @Test
    fun `should ignore comments when counting rloc for long methods`() {
        // Arrange
        val fileContent = """
            public class Example {
                public void methodWithComments() {
                    // This is a comment
                    int a = 1;
                    // Another comment
                    int b = 2;
                    /* Block comment */
                    int c = 3;
                    int d = 4;
                    int e = 5;
                    int f = 6;
                    int g = 7;
                    int h = 8;
                    int i = 9;
                    int j = 10;
                    // More comments
                    // Even more comments
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.LONG_METHOD.metricName]).isEqualTo(0.0)
    }
}
