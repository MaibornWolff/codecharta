package de.maibornwolff.codecharta.analysers.parsers.unified.codesmells

import de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors.TypescriptCollector
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableFileMetrics
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.io.File

class MessageChainsTest {
    private val collector = TypescriptCollector()

    private fun createTestFile(content: String): File {
        val tempFile = File.createTempFile("testFile", ".ts")
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should not detect message chains when there are no chained calls`() {
        // Arrange
        val fileContent = """
            class Example {
                method() {
                    const a = something();
                    const b = anotherThing();
                    console.log(a, b);
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.MESSAGE_CHAINS.metricName]).isEqualTo(0.0)
    }

    @Test
    fun `should not detect message chains when chain has exactly 3 calls`() {
        // Arrange
        val fileContent = """
            class Example {
                method() {
                    const result = obj.a().b().c();
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.MESSAGE_CHAINS.metricName]).isEqualTo(0.0)
    }

    @Test
    fun `should detect message chain when there are exactly 4 chained calls`() {
        // Arrange
        val fileContent = """
            class Example {
                method() {
                    const result = obj.a().b().c().d();
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.MESSAGE_CHAINS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should detect message chain when there are more than 4 chained calls`() {
        // Arrange
        val fileContent = """
            class Example {
                method() {
                    const result = obj.a().b().c().d().e().f();
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.MESSAGE_CHAINS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should detect multiple message chains in same file`() {
        // Arrange
        val fileContent = """
            class Example {
                method1() {
                    const result = obj.a().b().c().d();
                }

                method2() {
                    const another = foo.x().y().z().w();
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.MESSAGE_CHAINS.metricName]).isEqualTo(2.0)
    }

    @Test
    fun `should detect message chains with property access`() {
        // Arrange
        val fileContent = """
            class Example {
                method() {
                    const result = obj.prop.method().anotherProp.anotherMethod().third().fourth();
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.MESSAGE_CHAINS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count each chain only once`() {
        // Arrange
        val fileContent = """
            class Example {
                method() {
                    const result = obj.a().b().c().d().e();
                    console.log(result);
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.MESSAGE_CHAINS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should detect chains in arrow functions`() {
        // Arrange
        val fileContent = """
            const fn = () => {
                return data.filter(x => x > 0).map(x => x * 2).reduce((a, b) => a + b).toString();
            };
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.MESSAGE_CHAINS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should not detect chains in nested function calls`() {
        // Arrange
        val fileContent = """
            class Example {
                method() {
                    const result = func(a(), b(), c());
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.MESSAGE_CHAINS.metricName]).isEqualTo(0.0)
    }

    @Test
    fun `should detect chains across multiple statements`() {
        // Arrange
        val fileContent = """
            class Example {
                method() {
                    const first = obj.a().b().c().d();
                    const second = foo.x().y();
                    const third = bar.p().q().r().s().t();
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.MESSAGE_CHAINS.metricName]).isEqualTo(2.0)
    }

    @Test
    fun `should count only method calls not property accesses`() {
        // Arrange
        val fileContent = """
            class Example {
                method() {
                    const result = obj.prop1.prop2.prop3.method();
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.MESSAGE_CHAINS.metricName]).isEqualTo(0.0)
    }
}
