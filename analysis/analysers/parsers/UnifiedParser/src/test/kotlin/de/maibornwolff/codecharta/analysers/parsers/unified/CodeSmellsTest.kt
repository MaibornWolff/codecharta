package de.maibornwolff.codecharta.analysers.parsers.unified

import de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors.JavaCollector
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableFileMetrics
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.io.File

class CodeSmellsTest {
    private val collector = JavaCollector()

    private fun createTestFile(content: String): File {
        val tempFile = File.createTempFile("testFile", ".java")
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should detect no code smells when all functions are clean`() {
        // Arrange
        val fileContent = """
            public class Example {
                public void shortMethod(int a, int b) {
                    int x = a + b;
                    System.out.println(x);
                }

                public int anotherShort(int c) {
                    return c * 2;
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.LONG_METHOD.metricName]).isEqualTo(0.0)
        Assertions.assertThat(result.attributes[AvailableFileMetrics.LONG_PARAMETER_LIST.metricName]).isEqualTo(0.0)
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
        Assertions.assertThat(result.attributes[AvailableFileMetrics.LONG_PARAMETER_LIST.metricName]).isEqualTo(0.0)
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
        Assertions.assertThat(result.attributes[AvailableFileMetrics.LONG_METHOD.metricName]).isEqualTo(0.0)
        Assertions.assertThat(result.attributes[AvailableFileMetrics.LONG_PARAMETER_LIST.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should detect both code smells when present`() {
        // Arrange
        val fileContent = """
            public class Example {
                public void longMethodWithManyParams(int a, int b, int c, int d, int e) {
                    int x = a + b;
                    int y = c + d;
                    int z = e + x;
                    System.out.println(x);
                    System.out.println(y);
                    System.out.println(z);
                    int result = x + y + z;
                    System.out.println(result);
                    System.out.println(result * 2);
                    System.out.println(result * 3);
                    System.out.println(result * 4);
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.LONG_METHOD.metricName]).isEqualTo(1.0)
        Assertions.assertThat(result.attributes[AvailableFileMetrics.LONG_PARAMETER_LIST.metricName]).isEqualTo(1.0)
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
    fun `should count multiple functions with code smells`() {
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
        Assertions.assertThat(result.attributes[AvailableFileMetrics.LONG_METHOD.metricName]).isEqualTo(2.0)
        Assertions.assertThat(result.attributes[AvailableFileMetrics.LONG_PARAMETER_LIST.metricName]).isEqualTo(2.0)
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
