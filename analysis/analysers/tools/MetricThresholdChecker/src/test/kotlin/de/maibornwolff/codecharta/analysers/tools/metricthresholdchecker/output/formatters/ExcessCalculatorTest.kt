package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters

import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.MetricThreshold
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.ThresholdViolation
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.ViolationType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class ExcessCalculatorTest {
    @Test
    fun `should calculate positive excess for ABOVE_MAX violation`() {
        // Arrange
        val calculator = ExcessCalculator()
        val violation = ThresholdViolation(
            path = "File.kt",
            metricName = "rloc",
            actualValue = 150,
            threshold = MetricThreshold(max = 100),
            violationType = ViolationType.ABOVE_MAX
        )

        // Act
        val result = calculator.calculate(violation)

        // Assert
        assertThat(result).isEqualTo(50.0)
    }

    @Test
    fun `should calculate positive excess for BELOW_MIN violation`() {
        // Arrange
        val calculator = ExcessCalculator()
        val violation = ThresholdViolation(
            path = "File.kt",
            metricName = "coverage",
            actualValue = 50,
            threshold = MetricThreshold(min = 80),
            violationType = ViolationType.BELOW_MIN
        )

        // Act
        val result = calculator.calculate(violation)

        // Assert
        assertThat(result).isEqualTo(30.0)
    }

    @Test
    fun `should handle decimal values for ABOVE_MAX`() {
        // Arrange
        val calculator = ExcessCalculator()
        val violation = ThresholdViolation(
            path = "File.kt",
            metricName = "complexity",
            actualValue = 15.5,
            threshold = MetricThreshold(max = 10.0),
            violationType = ViolationType.ABOVE_MAX
        )

        // Act
        val result = calculator.calculate(violation)

        // Assert
        assertThat(result).isEqualTo(5.5)
    }

    @Test
    fun `should handle decimal values for BELOW_MIN`() {
        // Arrange
        val calculator = ExcessCalculator()
        val violation = ThresholdViolation(
            path = "File.kt",
            metricName = "coverage",
            actualValue = 75.5,
            threshold = MetricThreshold(min = 80.0),
            violationType = ViolationType.BELOW_MIN
        )

        // Act
        val result = calculator.calculate(violation)

        // Assert
        assertThat(result).isEqualTo(4.5)
    }

    @Test
    fun `should return zero when actual equals max threshold`() {
        // Arrange
        val calculator = ExcessCalculator()
        val violation = ThresholdViolation(
            path = "File.kt",
            metricName = "rloc",
            actualValue = 100,
            threshold = MetricThreshold(max = 100),
            violationType = ViolationType.ABOVE_MAX
        )

        // Act
        val result = calculator.calculate(violation)

        // Assert
        assertThat(result).isEqualTo(0.0)
    }

    @Test
    fun `should return zero when actual equals min threshold`() {
        // Arrange
        val calculator = ExcessCalculator()
        val violation = ThresholdViolation(
            path = "File.kt",
            metricName = "coverage",
            actualValue = 80,
            threshold = MetricThreshold(min = 80),
            violationType = ViolationType.BELOW_MIN
        )

        // Act
        val result = calculator.calculate(violation)

        // Assert
        assertThat(result).isEqualTo(0.0)
    }

    @Test
    fun `should handle large excess values`() {
        // Arrange
        val calculator = ExcessCalculator()
        val violation = ThresholdViolation(
            path = "File.kt",
            metricName = "rloc",
            actualValue = 1000,
            threshold = MetricThreshold(max = 100),
            violationType = ViolationType.ABOVE_MAX
        )

        // Act
        val result = calculator.calculate(violation)

        // Assert
        assertThat(result).isEqualTo(900.0)
    }
}
