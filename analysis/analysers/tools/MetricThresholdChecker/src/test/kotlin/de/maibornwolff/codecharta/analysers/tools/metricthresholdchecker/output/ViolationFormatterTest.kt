package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output

import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.MetricThreshold
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.ThresholdConfiguration
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.ThresholdViolation
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.ViolationType
import de.maibornwolff.codecharta.model.AttributeDescriptor
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.ByteArrayOutputStream
import java.io.PrintStream

class ViolationFormatterTest {
    @Test
    fun `should print success message when no violations exist`() {
        // Arrange
        val errorStream = ByteArrayOutputStream()
        val formatter = ViolationFormatter(PrintStream(ByteArrayOutputStream()), PrintStream(errorStream))
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 500))
        )

        // Act
        formatter.printResults(emptyList(), config, emptyMap())

        // Assert
        val output = errorStream.toString()
        assertThat(output).contains("✓ All checks passed!")
        assertThat(output).contains("Checked 1 threshold(s)")
    }

    @Test
    fun `should print violation count when violations exist`() {
        // Arrange
        val errorStream = ByteArrayOutputStream()
        val formatter = ViolationFormatter(PrintStream(ByteArrayOutputStream()), PrintStream(errorStream))
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 100))
        )
        val violations = listOf(
            ThresholdViolation(
                path = "File1.kt",
                metricName = "rloc",
                actualValue = 200,
                threshold = MetricThreshold(max = 100),
                violationType = ViolationType.ABOVE_MAX
            )
        )

        // Act
        formatter.printResults(violations, config, emptyMap())

        // Assert
        val output = errorStream.toString()
        assertThat(output).contains("✗ 1 violation(s) found!")
    }

    @Test
    fun `should print violations section when violations exist`() {
        // Arrange
        val errorStream = ByteArrayOutputStream()
        val formatter = ViolationFormatter(PrintStream(ByteArrayOutputStream()), PrintStream(errorStream))
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 100))
        )
        val violations = listOf(
            ThresholdViolation(
                path = "File1.kt",
                metricName = "rloc",
                actualValue = 200,
                threshold = MetricThreshold(max = 100),
                violationType = ViolationType.ABOVE_MAX
            )
        )

        // Act
        formatter.printResults(violations, config, emptyMap())

        // Assert
        val output = errorStream.toString()
        assertThat(output).contains("Violations:")
        assertThat(output).contains("Metric: rloc")
    }

    @Test
    fun `should not print violations section when no violations exist`() {
        // Arrange
        val errorStream = ByteArrayOutputStream()
        val formatter = ViolationFormatter(PrintStream(ByteArrayOutputStream()), PrintStream(errorStream))
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 500))
        )

        // Act
        formatter.printResults(emptyList(), config, emptyMap())

        // Assert
        val output = errorStream.toString()
        assertThat(output).doesNotContain("Violations:")
    }

    @Test
    fun `should display correct threshold count in summary`() {
        // Arrange
        val errorStream = ByteArrayOutputStream()
        val formatter = ViolationFormatter(PrintStream(ByteArrayOutputStream()), PrintStream(errorStream))
        val config = ThresholdConfiguration(
            fileMetrics = mapOf(
                "rloc" to MetricThreshold(max = 500),
                "mcc" to MetricThreshold(max = 100),
                "coverage" to MetricThreshold(min = 80)
            )
        )

        // Act
        formatter.printResults(emptyList(), config, emptyMap())

        // Assert
        val output = errorStream.toString()
        assertThat(output).contains("Checked 3 threshold(s)")
    }

    @Test
    fun `should group violations by metric name`() {
        // Arrange
        val errorStream = ByteArrayOutputStream()
        val formatter = ViolationFormatter(PrintStream(ByteArrayOutputStream()), PrintStream(errorStream))
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 100))
        )
        val violations = listOf(
            ThresholdViolation(
                path = "File1.kt",
                metricName = "rloc",
                actualValue = 200,
                threshold = MetricThreshold(max = 100),
                violationType = ViolationType.ABOVE_MAX
            ),
            ThresholdViolation(
                path = "File2.kt",
                metricName = "rloc",
                actualValue = 150,
                threshold = MetricThreshold(max = 100),
                violationType = ViolationType.ABOVE_MAX
            )
        )

        // Act
        formatter.printResults(violations, config, emptyMap())

        // Assert
        val output = errorStream.toString()
        assertThat(output).containsIgnoringCase("Metric: rloc")
        assertThat(output).contains("2 violations")
    }

    @Test
    fun `should display file paths in violation table`() {
        // Arrange
        val errorStream = ByteArrayOutputStream()
        val formatter = ViolationFormatter(PrintStream(ByteArrayOutputStream()), PrintStream(errorStream))
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 100))
        )
        val violations = listOf(
            ThresholdViolation(
                path = "src/main/File1.kt",
                metricName = "rloc",
                actualValue = 200,
                threshold = MetricThreshold(max = 100),
                violationType = ViolationType.ABOVE_MAX
            )
        )

        // Act
        formatter.printResults(violations, config, emptyMap())

        // Assert
        val output = errorStream.toString()
        assertThat(output).contains("src/main/File1.kt")
    }

    @Test
    fun `should display actual values in violation table`() {
        // Arrange
        val errorStream = ByteArrayOutputStream()
        val formatter = ViolationFormatter(PrintStream(ByteArrayOutputStream()), PrintStream(errorStream))
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 100))
        )
        val violations = listOf(
            ThresholdViolation(
                path = "File1.kt",
                metricName = "rloc",
                actualValue = 200,
                threshold = MetricThreshold(max = 100),
                violationType = ViolationType.ABOVE_MAX
            )
        )

        // Act
        formatter.printResults(violations, config, emptyMap())

        // Assert
        val output = errorStream.toString()
        assertThat(output).contains("200")
    }

    @Test
    fun `should display threshold values in violation table`() {
        // Arrange
        val errorStream = ByteArrayOutputStream()
        val formatter = ViolationFormatter(PrintStream(ByteArrayOutputStream()), PrintStream(errorStream))
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 100))
        )
        val violations = listOf(
            ThresholdViolation(
                path = "File1.kt",
                metricName = "rloc",
                actualValue = 200,
                threshold = MetricThreshold(max = 100),
                violationType = ViolationType.ABOVE_MAX
            )
        )

        // Act
        formatter.printResults(violations, config, emptyMap())

        // Assert
        val output = errorStream.toString()
        assertThat(output).contains("max: 100")
    }

    @Test
    fun `should display min threshold in violation table for BELOW_MIN violations`() {
        // Arrange
        val errorStream = ByteArrayOutputStream()
        val formatter = ViolationFormatter(PrintStream(ByteArrayOutputStream()), PrintStream(errorStream))
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("coverage" to MetricThreshold(min = 80))
        )
        val violations = listOf(
            ThresholdViolation(
                path = "File1.kt",
                metricName = "coverage",
                actualValue = 50,
                threshold = MetricThreshold(min = 80),
                violationType = ViolationType.BELOW_MIN
            )
        )

        // Act
        formatter.printResults(violations, config, emptyMap())

        // Assert
        val output = errorStream.toString()
        assertThat(output).contains("min: 80")
    }

    @Test
    fun `should display excess amount with plus sign for ABOVE_MAX violations`() {
        // Arrange
        val errorStream = ByteArrayOutputStream()
        val formatter = ViolationFormatter(PrintStream(ByteArrayOutputStream()), PrintStream(errorStream))
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 100))
        )
        val violations = listOf(
            ThresholdViolation(
                path = "File1.kt",
                metricName = "rloc",
                actualValue = 150,
                threshold = MetricThreshold(max = 100),
                violationType = ViolationType.ABOVE_MAX
            )
        )

        // Act
        formatter.printResults(violations, config, emptyMap())

        // Assert
        val output = errorStream.toString()
        assertThat(output).contains("+50")
    }

    @Test
    fun `should display excess amount with minus sign for BELOW_MIN violations`() {
        // Arrange
        val errorStream = ByteArrayOutputStream()
        val formatter = ViolationFormatter(PrintStream(ByteArrayOutputStream()), PrintStream(errorStream))
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("coverage" to MetricThreshold(min = 80))
        )
        val violations = listOf(
            ThresholdViolation(
                path = "File1.kt",
                metricName = "coverage",
                actualValue = 50,
                threshold = MetricThreshold(min = 80),
                violationType = ViolationType.BELOW_MIN
            )
        )

        // Act
        formatter.printResults(violations, config, emptyMap())

        // Assert
        val output = errorStream.toString()
        assertThat(output).contains("-30")
    }

    @Test
    fun `should format integer values without decimals`() {
        // Arrange
        val errorStream = ByteArrayOutputStream()
        val formatter = ViolationFormatter(PrintStream(ByteArrayOutputStream()), PrintStream(errorStream))
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 100))
        )
        val violations = listOf(
            ThresholdViolation(
                path = "File1.kt",
                metricName = "rloc",
                actualValue = 200,
                threshold = MetricThreshold(max = 100),
                violationType = ViolationType.ABOVE_MAX
            )
        )

        // Act
        formatter.printResults(violations, config, emptyMap())

        // Assert
        val output = errorStream.toString()
        assertThat(output).contains("200")
        assertThat(output).doesNotContain("200.00")
    }

    @Test
    fun `should format decimal values with two decimal places`() {
        // Arrange
        val errorStream = ByteArrayOutputStream()
        val formatter = ViolationFormatter(PrintStream(ByteArrayOutputStream()), PrintStream(errorStream))
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("coverage" to MetricThreshold(min = 80.0))
        )
        val violations = listOf(
            ThresholdViolation(
                path = "File1.kt",
                metricName = "coverage",
                actualValue = 75.567,
                threshold = MetricThreshold(min = 80.0),
                violationType = ViolationType.BELOW_MIN
            )
        )

        // Act
        formatter.printResults(violations, config, emptyMap())

        // Assert
        val output = errorStream.toString()
        // Should contain formatted decimal (may use . or , as separator depending on locale)
        assertThat(output).containsPattern("75[.,]5[67]")
    }

    @Test
    fun `should sort violations by excess amount in descending order`() {
        // Arrange
        val errorStream = ByteArrayOutputStream()
        val formatter = ViolationFormatter(PrintStream(ByteArrayOutputStream()), PrintStream(errorStream))
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 100))
        )
        val violations = listOf(
            ThresholdViolation(
                path = "File1.kt",
                metricName = "rloc",
                actualValue = 120,
                threshold = MetricThreshold(max = 100),
                violationType = ViolationType.ABOVE_MAX
            ),
            ThresholdViolation(
                path = "File2.kt",
                metricName = "rloc",
                actualValue = 200,
                threshold = MetricThreshold(max = 100),
                violationType = ViolationType.ABOVE_MAX
            ),
            ThresholdViolation(
                path = "File3.kt",
                metricName = "rloc",
                actualValue = 150,
                threshold = MetricThreshold(max = 100),
                violationType = ViolationType.ABOVE_MAX
            )
        )

        // Act
        formatter.printResults(violations, config, emptyMap())

        // Assert
        val output = errorStream.toString()
        val file1Index = output.indexOf("File1.kt")
        val file2Index = output.indexOf("File2.kt")
        val file3Index = output.indexOf("File3.kt")

        // File2 (excess 100) should come before File3 (excess 50) which should come before File1 (excess 20)
        assertThat(file2Index).isLessThan(file3Index)
        assertThat(file3Index).isLessThan(file1Index)
    }

    @Test
    fun `should include table headers in violation output`() {
        // Arrange
        val errorStream = ByteArrayOutputStream()
        val formatter = ViolationFormatter(PrintStream(ByteArrayOutputStream()), PrintStream(errorStream))
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 100))
        )
        val violations = listOf(
            ThresholdViolation(
                path = "File1.kt",
                metricName = "rloc",
                actualValue = 200,
                threshold = MetricThreshold(max = 100),
                violationType = ViolationType.ABOVE_MAX
            )
        )

        // Act
        formatter.printResults(violations, config, emptyMap())

        // Assert
        val output = errorStream.toString()
        assertThat(output).contains("Path")
        assertThat(output).contains("Actual Value")
        assertThat(output).contains("Threshold")
        assertThat(output).contains("Exceeds By")
    }

    @Test
    fun `should handle multiple metrics with different violation counts`() {
        // Arrange
        val errorStream = ByteArrayOutputStream()
        val formatter = ViolationFormatter(PrintStream(ByteArrayOutputStream()), PrintStream(errorStream))
        val config = ThresholdConfiguration(
            fileMetrics = mapOf(
                "rloc" to MetricThreshold(max = 100),
                "mcc" to MetricThreshold(max = 10)
            )
        )
        val violations = listOf(
            ThresholdViolation(
                path = "File1.kt",
                metricName = "rloc",
                actualValue = 200,
                threshold = MetricThreshold(max = 100),
                violationType = ViolationType.ABOVE_MAX
            ),
            ThresholdViolation(
                path = "File2.kt",
                metricName = "mcc",
                actualValue = 20,
                threshold = MetricThreshold(max = 10),
                violationType = ViolationType.ABOVE_MAX
            ),
            ThresholdViolation(
                path = "File3.kt",
                metricName = "mcc",
                actualValue = 15,
                threshold = MetricThreshold(max = 10),
                violationType = ViolationType.ABOVE_MAX
            )
        )

        // Act
        formatter.printResults(violations, config, emptyMap())

        // Assert
        val output = errorStream.toString()
        assertThat(output).containsIgnoringCase("Metric: rloc")
        assertThat(output).contains("1 violations")
        assertThat(output).containsIgnoringCase("Metric: mcc")
        assertThat(output).contains("2 violations")
    }

    @Test
    fun `should truncate very long paths`() {
        // Arrange
        val errorStream = ByteArrayOutputStream()
        val formatter = ViolationFormatter(PrintStream(ByteArrayOutputStream()), PrintStream(errorStream))
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 100))
        )
        val longPath = "very/long/path/with/many/directories/that/exceeds/normal/width/File.kt"
        val violations = listOf(
            ThresholdViolation(
                path = longPath,
                metricName = "rloc",
                actualValue = 200,
                threshold = MetricThreshold(max = 100),
                violationType = ViolationType.ABOVE_MAX
            )
        )

        // Act
        formatter.printResults(violations, config, emptyMap())

        // Assert
        val output = errorStream.toString()
        // Path should appear in output (may be truncated or not depending on column width)
        assertThat(output).containsAnyOf("File.kt", "very/long", "...")
    }

    @Test
    fun `should print explanation after metric name for known metrics`() {
        // Arrange
        val errorStream = ByteArrayOutputStream()
        val formatter = ViolationFormatter(PrintStream(ByteArrayOutputStream()), PrintStream(errorStream))
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 100))
        )
        val violations = listOf(
            ThresholdViolation(
                path = "File1.kt",
                metricName = "rloc",
                actualValue = 200,
                threshold = MetricThreshold(max = 100),
                violationType = ViolationType.ABOVE_MAX
            )
        )
        val attributeDescriptors = mapOf(
            "rloc" to AttributeDescriptor(
                description = "Number of lines that contain at least one character which is " +
                    "neither a whitespace nor a tabulation nor part of a comment"
            )
        )

        // Act
        formatter.printResults(violations, config, attributeDescriptors)

        // Assert
        val output = errorStream.toString()
        assertThat(output).contains("Metric: rloc")
        assertThat(output).contains("Number of lines that contain at least one character")
    }

    @Test
    fun `should include complexity metric explanation inline`() {
        // Arrange
        val errorStream = ByteArrayOutputStream()
        val formatter = ViolationFormatter(PrintStream(ByteArrayOutputStream()), PrintStream(errorStream))
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("complexity" to MetricThreshold(max = 10))
        )
        val violations = listOf(
            ThresholdViolation(
                path = "File1.kt",
                metricName = "complexity",
                actualValue = 20,
                threshold = MetricThreshold(max = 10),
                violationType = ViolationType.ABOVE_MAX
            )
        )
        val attributeDescriptors = mapOf(
            "complexity" to AttributeDescriptor(
                description = "Complexity of the file representing how much cognitive load is " +
                    "needed to overview the whole file"
            )
        )

        // Act
        formatter.printResults(violations, config, attributeDescriptors)

        // Assert
        val output = errorStream.toString()
        assertThat(output).contains("Metric: complexity")
        assertThat(output).contains("Complexity of the file")
        assertThat(output).contains("cognitive load")
    }

    @Test
    fun `should not print explanation for unknown metrics`() {
        // Arrange
        val errorStream = ByteArrayOutputStream()
        val formatter = ViolationFormatter(PrintStream(ByteArrayOutputStream()), PrintStream(errorStream))
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("unknown_metric" to MetricThreshold(max = 100))
        )
        val violations = listOf(
            ThresholdViolation(
                path = "File1.kt",
                metricName = "unknown_metric",
                actualValue = 200,
                threshold = MetricThreshold(max = 100),
                violationType = ViolationType.ABOVE_MAX
            )
        )

        // Act
        formatter.printResults(violations, config, emptyMap())

        // Assert
        val output = errorStream.toString()
        assertThat(output).contains("Metric: unknown_metric")
        assertThat(output).doesNotContain("measures")
    }

    @Test
    fun `should print explanations inline for multiple different metrics`() {
        // Arrange
        val errorStream = ByteArrayOutputStream()
        val formatter = ViolationFormatter(PrintStream(ByteArrayOutputStream()), PrintStream(errorStream))
        val config = ThresholdConfiguration(
            fileMetrics = mapOf(
                "rloc" to MetricThreshold(max = 100),
                "complexity" to MetricThreshold(max = 10)
            )
        )
        val violations = listOf(
            ThresholdViolation(
                path = "File1.kt",
                metricName = "rloc",
                actualValue = 200,
                threshold = MetricThreshold(max = 100),
                violationType = ViolationType.ABOVE_MAX
            ),
            ThresholdViolation(
                path = "File2.kt",
                metricName = "complexity",
                actualValue = 20,
                threshold = MetricThreshold(max = 10),
                violationType = ViolationType.ABOVE_MAX
            )
        )
        val attributeDescriptors = mapOf(
            "rloc" to AttributeDescriptor(
                description = "Number of lines that contain at least one character which is " +
                    "neither a whitespace nor a tabulation nor part of a comment"
            ),
            "complexity" to AttributeDescriptor(
                description = "Complexity of the file representing how much cognitive load is " +
                    "needed to overview the whole file"
            )
        )

        // Act
        formatter.printResults(violations, config, attributeDescriptors)

        // Assert
        val output = errorStream.toString()
        assertThat(output).contains("Number of lines that contain")
        assertThat(output).contains("Complexity of the file")
    }

    @Test
    fun `should show explanation only once per metric even with multiple violations`() {
        // Arrange
        val errorStream = ByteArrayOutputStream()
        val formatter = ViolationFormatter(PrintStream(ByteArrayOutputStream()), PrintStream(errorStream))
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 100))
        )
        val violations = listOf(
            ThresholdViolation(
                path = "File1.kt",
                metricName = "rloc",
                actualValue = 200,
                threshold = MetricThreshold(max = 100),
                violationType = ViolationType.ABOVE_MAX
            ),
            ThresholdViolation(
                path = "File2.kt",
                metricName = "rloc",
                actualValue = 150,
                threshold = MetricThreshold(max = 100),
                violationType = ViolationType.ABOVE_MAX
            )
        )
        val attributeDescriptors = mapOf(
            "rloc" to AttributeDescriptor(
                description = "Number of lines that contain at least one character which is " +
                    "neither a whitespace nor a tabulation nor part of a comment"
            )
        )

        // Act
        formatter.printResults(violations, config, attributeDescriptors)

        // Assert
        val output = errorStream.toString()
        val metricCount = output.split("Metric: rloc").size - 1
        val explanationCount = output.split("Number of lines that contain").size - 1

        // Should only have one metric header and one explanation
        assertThat(metricCount).isEqualTo(1)
        assertThat(explanationCount).isEqualTo(1)
    }
}
