package de.maibornwolff.codecharta.analysers.parsers.unified.codesmells

import de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors.TreeSitterLibraryCollector
import de.maibornwolff.treesitter.excavationsite.api.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.api.Language
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.io.File

class LongParameterListTest {
    private val collector = TreeSitterLibraryCollector(Language.JAVA)

    private fun createTestFile(content: String): File {
        val tempFile = File.createTempFile("testFile", ".java")
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should detect long parameter list when function has more than 4 parameters`() {
        // Arrange
        val fileContent = """
            public class Example {
                public void manyParams(int a, int b, int c, int d, int e) {
                    System.out.println(a + b + c + d + e);
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.LONG_PARAMETER_LIST.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should not detect long parameter list when function has exactly 4 parameters`() {
        // Arrange
        val fileContent = """
            public class Example {
                public void exactlyFourParams(int a, int b, int c, int d) {
                    System.out.println(a + b + c + d);
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.LONG_PARAMETER_LIST.metricName]).isEqualTo(0.0)
    }

    @Test
    fun `should count multiple functions with long parameter list smell`() {
        // Arrange
        val fileContent = """
            public class Example {
                public void manyParams1(int a, int b, int c, int d, int e) {
                    System.out.println(a);
                }

                public void manyParams2(int a, int b, int c, int d, int e, int f) {
                    System.out.println(a);
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.LONG_PARAMETER_LIST.metricName]).isEqualTo(2.0)
    }
}
