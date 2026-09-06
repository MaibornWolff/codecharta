package de.maibornwolff.treesitter.excavationsite.api.contract

import de.maibornwolff.treesitter.excavationsite.api.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.api.AvailableFunctionMetrics
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

/**
 * Contract tests for metric key stability.
 * These tests verify that all expected metric keys exist in results.
 * Failures indicate a metric key was removed or renamed.
 */
class MetricKeyStabilityContractTest {
    companion object {
        private val SAMPLE_CODE = """
            public class Sample {
                // A comment
                public void method1(int a, int b) {
                    if (a > b) {
                        System.out.println("a is greater");
                    }
                }

                public int method2() {
                    return 42;
                }
            }
        """.trimIndent()
    }

    @Nested
    inner class FileMetricKeysContract {
        @Test
        fun `should have complexity metric key`() {
            // Act
            val result = TreeSitterMetrics.parse(SAMPLE_CODE, Language.JAVA)

            // Assert
            assertThat(result.metrics).containsKey("complexity")
        }

        @Test
        fun `should have logic_complexity metric key`() {
            // Act
            val result = TreeSitterMetrics.parse(SAMPLE_CODE, Language.JAVA)

            // Assert
            assertThat(result.metrics).containsKey("logic_complexity")
        }

        @Test
        fun `should have comment_lines metric key`() {
            // Act
            val result = TreeSitterMetrics.parse(SAMPLE_CODE, Language.JAVA)

            // Assert
            assertThat(result.metrics).containsKey("comment_lines")
        }

        @Test
        fun `should have number_of_functions metric key`() {
            // Act
            val result = TreeSitterMetrics.parse(SAMPLE_CODE, Language.JAVA)

            // Assert
            assertThat(result.metrics).containsKey("number_of_functions")
        }

        @Test
        fun `should have message_chains metric key`() {
            // Act
            val result = TreeSitterMetrics.parse(SAMPLE_CODE, Language.JAVA)

            // Assert
            assertThat(result.metrics).containsKey("message_chains")
        }

        @Test
        fun `should have rloc metric key`() {
            // Act
            val result = TreeSitterMetrics.parse(SAMPLE_CODE, Language.JAVA)

            // Assert
            assertThat(result.metrics).containsKey("rloc")
        }

        @Test
        fun `should have loc metric key`() {
            // Act
            val result = TreeSitterMetrics.parse(SAMPLE_CODE, Language.JAVA)

            // Assert
            assertThat(result.metrics).containsKey("loc")
        }

        @Test
        fun `should have long_method metric key`() {
            // Act
            val result = TreeSitterMetrics.parse(SAMPLE_CODE, Language.JAVA)

            // Assert
            assertThat(result.metrics).containsKey("long_method")
        }

        @Test
        fun `should have long_parameter_list metric key`() {
            // Act
            val result = TreeSitterMetrics.parse(SAMPLE_CODE, Language.JAVA)

            // Assert
            assertThat(result.metrics).containsKey("long_parameter_list")
        }

        @Test
        fun `should have excessive_comments metric key`() {
            // Act
            val result = TreeSitterMetrics.parse(SAMPLE_CODE, Language.JAVA)

            // Assert
            assertThat(result.metrics).containsKey("excessive_comments")
        }

        @Test
        fun `should have comment_ratio metric key`() {
            // Act
            val result = TreeSitterMetrics.parse(SAMPLE_CODE, Language.JAVA)

            // Assert
            assertThat(result.metrics).containsKey("comment_ratio")
        }

        @Test
        fun `should contain all AvailableFileMetrics keys`() {
            // Act
            val result = TreeSitterMetrics.parse(SAMPLE_CODE, Language.JAVA)

            // Assert
            AvailableFileMetrics.entries.forEach { metric ->
                assertThat(result.metrics)
                    .withFailMessage("Missing file metric key: ${metric.metricName}")
                    .containsKey(metric.metricName)
            }
        }
    }

    @Nested
    inner class PerFunctionMetricKeysContract {
        @Test
        fun `should have max_complexity_per_function metric key`() {
            // Act
            val result = TreeSitterMetrics.parse(SAMPLE_CODE, Language.JAVA)

            // Assert
            assertThat(result.perFunctionMetrics).containsKey("max_complexity_per_function")
        }

        @Test
        fun `should have min_complexity_per_function metric key`() {
            // Act
            val result = TreeSitterMetrics.parse(SAMPLE_CODE, Language.JAVA)

            // Assert
            assertThat(result.perFunctionMetrics).containsKey("min_complexity_per_function")
        }

        @Test
        fun `should have mean_complexity_per_function metric key`() {
            // Act
            val result = TreeSitterMetrics.parse(SAMPLE_CODE, Language.JAVA)

            // Assert
            assertThat(result.perFunctionMetrics).containsKey("mean_complexity_per_function")
        }

        @Test
        fun `should have median_complexity_per_function metric key`() {
            // Act
            val result = TreeSitterMetrics.parse(SAMPLE_CODE, Language.JAVA)

            // Assert
            assertThat(result.perFunctionMetrics).containsKey("median_complexity_per_function")
        }

        @Test
        fun `should have max_parameters_per_function metric key`() {
            // Act
            val result = TreeSitterMetrics.parse(SAMPLE_CODE, Language.JAVA)

            // Assert
            assertThat(result.perFunctionMetrics).containsKey("max_parameters_per_function")
        }

        @Test
        fun `should have min_parameters_per_function metric key`() {
            // Act
            val result = TreeSitterMetrics.parse(SAMPLE_CODE, Language.JAVA)

            // Assert
            assertThat(result.perFunctionMetrics).containsKey("min_parameters_per_function")
        }

        @Test
        fun `should have mean_parameters_per_function metric key`() {
            // Act
            val result = TreeSitterMetrics.parse(SAMPLE_CODE, Language.JAVA)

            // Assert
            assertThat(result.perFunctionMetrics).containsKey("mean_parameters_per_function")
        }

        @Test
        fun `should have median_parameters_per_function metric key`() {
            // Act
            val result = TreeSitterMetrics.parse(SAMPLE_CODE, Language.JAVA)

            // Assert
            assertThat(result.perFunctionMetrics).containsKey("median_parameters_per_function")
        }

        @Test
        fun `should have max_rloc_per_function metric key`() {
            // Act
            val result = TreeSitterMetrics.parse(SAMPLE_CODE, Language.JAVA)

            // Assert
            assertThat(result.perFunctionMetrics).containsKey("max_rloc_per_function")
        }

        @Test
        fun `should have min_rloc_per_function metric key`() {
            // Act
            val result = TreeSitterMetrics.parse(SAMPLE_CODE, Language.JAVA)

            // Assert
            assertThat(result.perFunctionMetrics).containsKey("min_rloc_per_function")
        }

        @Test
        fun `should have mean_rloc_per_function metric key`() {
            // Act
            val result = TreeSitterMetrics.parse(SAMPLE_CODE, Language.JAVA)

            // Assert
            assertThat(result.perFunctionMetrics).containsKey("mean_rloc_per_function")
        }

        @Test
        fun `should have median_rloc_per_function metric key`() {
            // Act
            val result = TreeSitterMetrics.parse(SAMPLE_CODE, Language.JAVA)

            // Assert
            assertThat(result.perFunctionMetrics).containsKey("median_rloc_per_function")
        }

        @Test
        fun `should contain all expected per-function metric aggregations`() {
            // Arrange
            val aggregations = listOf("max", "min", "mean", "median")

            // Act
            val result = TreeSitterMetrics.parse(SAMPLE_CODE, Language.JAVA)

            // Assert
            AvailableFunctionMetrics.entries.forEach { metric ->
                aggregations.forEach { aggregation ->
                    val key = "${aggregation}_${metric.metricName}_per_function"
                    assertThat(result.perFunctionMetrics)
                        .withFailMessage("Missing per-function metric key: $key")
                        .containsKey(key)
                }
            }
        }
    }

    @Nested
    inner class AvailableMetricsEnumContract {
        @Test
        fun `should have exactly 11 file metrics`() {
            // Assert
            assertThat(AvailableFileMetrics.entries).hasSize(11)
        }

        @Test
        fun `should have COMPLEXITY file metric`() {
            // Assert
            assertThat(AvailableFileMetrics.COMPLEXITY.metricName).isEqualTo("complexity")
        }

        @Test
        fun `should have LOGIC_COMPLEXITY file metric`() {
            // Assert
            assertThat(AvailableFileMetrics.LOGIC_COMPLEXITY.metricName).isEqualTo("logic_complexity")
        }

        @Test
        fun `should have COMMENT_LINES file metric`() {
            // Assert
            assertThat(AvailableFileMetrics.COMMENT_LINES.metricName).isEqualTo("comment_lines")
        }

        @Test
        fun `should have NUMBER_OF_FUNCTIONS file metric`() {
            // Assert
            assertThat(AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName).isEqualTo("number_of_functions")
        }

        @Test
        fun `should have MESSAGE_CHAINS file metric`() {
            // Assert
            assertThat(AvailableFileMetrics.MESSAGE_CHAINS.metricName).isEqualTo("message_chains")
        }

        @Test
        fun `should have REAL_LINES_OF_CODE file metric`() {
            // Assert
            assertThat(AvailableFileMetrics.REAL_LINES_OF_CODE.metricName).isEqualTo("rloc")
        }

        @Test
        fun `should have LINES_OF_CODE file metric`() {
            // Assert
            assertThat(AvailableFileMetrics.LINES_OF_CODE.metricName).isEqualTo("loc")
        }

        @Test
        fun `should have LONG_METHOD file metric`() {
            // Assert
            assertThat(AvailableFileMetrics.LONG_METHOD.metricName).isEqualTo("long_method")
        }

        @Test
        fun `should have LONG_PARAMETER_LIST file metric`() {
            // Assert
            assertThat(AvailableFileMetrics.LONG_PARAMETER_LIST.metricName).isEqualTo("long_parameter_list")
        }

        @Test
        fun `should have EXCESSIVE_COMMENTS file metric`() {
            // Assert
            assertThat(AvailableFileMetrics.EXCESSIVE_COMMENTS.metricName).isEqualTo("excessive_comments")
        }

        @Test
        fun `should have COMMENT_RATIO file metric`() {
            // Assert
            assertThat(AvailableFileMetrics.COMMENT_RATIO.metricName).isEqualTo("comment_ratio")
        }

        @Test
        fun `should have exactly 3 function metrics`() {
            // Assert
            assertThat(AvailableFunctionMetrics.entries).hasSize(3)
        }

        @Test
        fun `should have PARAMETERS function metric`() {
            // Assert
            assertThat(AvailableFunctionMetrics.PARAMETERS.metricName).isEqualTo("parameters")
        }

        @Test
        fun `should have COMPLEXITY function metric`() {
            // Assert
            assertThat(AvailableFunctionMetrics.COMPLEXITY.metricName).isEqualTo("complexity")
        }

        @Test
        fun `should have RLOC function metric`() {
            // Assert
            assertThat(AvailableFunctionMetrics.RLOC.metricName).isEqualTo("rloc")
        }
    }
}
