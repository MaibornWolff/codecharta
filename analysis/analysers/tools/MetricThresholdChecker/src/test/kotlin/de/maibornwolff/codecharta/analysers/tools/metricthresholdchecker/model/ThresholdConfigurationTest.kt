package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test

class ThresholdConfigurationTest {
    @Test
    fun `should create threshold with only min value`() {
        // Arrange & Act
        val threshold = MetricThreshold(min = 10)

        // Assert
        assertThat(threshold.min).isEqualTo(10)
        assertThat(threshold.max).isNull()
    }

    @Test
    fun `should create threshold with only max value`() {
        // Arrange & Act
        val threshold = MetricThreshold(max = 100)

        // Assert
        assertThat(threshold.min).isNull()
        assertThat(threshold.max).isEqualTo(100)
    }

    @Test
    fun `should create threshold with both min and max values`() {
        // Arrange & Act
        val threshold = MetricThreshold(min = 10, max = 100)

        // Assert
        assertThat(threshold.min).isEqualTo(10)
        assertThat(threshold.max).isEqualTo(100)
    }

    @Test
    fun `should throw exception when both min and max are null`() {
        // Arrange & Act & Assert
        assertThatThrownBy {
            MetricThreshold(min = null, max = null)
        }.isInstanceOf(IllegalArgumentException::class.java)
            .hasMessageContaining("At least one of 'min' or 'max' must be specified")
    }

    @Test
    fun `should return true when value is below min threshold`() {
        // Arrange
        val threshold = MetricThreshold(min = 50)

        // Act
        val isViolated = threshold.isViolated(30)

        // Assert
        assertThat(isViolated).isTrue()
    }

    @Test
    fun `should return true when value is above max threshold`() {
        // Arrange
        val threshold = MetricThreshold(max = 100)

        // Act
        val isViolated = threshold.isViolated(150)

        // Assert
        assertThat(isViolated).isTrue()
    }

    @Test
    fun `should return false when value is within range`() {
        // Arrange
        val threshold = MetricThreshold(min = 10, max = 100)

        // Act
        val isViolated = threshold.isViolated(50)

        // Assert
        assertThat(isViolated).isFalse()
    }

    @Test
    fun `should return false when value equals min threshold`() {
        // Arrange
        val threshold = MetricThreshold(min = 50)

        // Act
        val isViolated = threshold.isViolated(50)

        // Assert
        assertThat(isViolated).isFalse()
    }

    @Test
    fun `should return false when value equals max threshold`() {
        // Arrange
        val threshold = MetricThreshold(max = 100)

        // Act
        val isViolated = threshold.isViolated(100)

        // Assert
        assertThat(isViolated).isFalse()
    }

    @Test
    fun `should handle decimal values for thresholds`() {
        // Arrange
        val threshold = MetricThreshold(min = 10.5, max = 99.9)

        // Act
        val belowMin = threshold.isViolated(10.4)
        val aboveMax = threshold.isViolated(100.0)
        val withinRange = threshold.isViolated(50.5)

        // Assert
        assertThat(belowMin).isTrue()
        assertThat(aboveMax).isTrue()
        assertThat(withinRange).isFalse()
    }

    @Test
    fun `should handle negative threshold values`() {
        // Arrange
        val threshold = MetricThreshold(min = -10, max = 10)

        // Act
        val belowMin = threshold.isViolated(-15)
        val withinRange = threshold.isViolated(0)
        val aboveMax = threshold.isViolated(15)

        // Assert
        assertThat(belowMin).isTrue()
        assertThat(withinRange).isFalse()
        assertThat(aboveMax).isTrue()
    }

    @Test
    fun `should handle zero as threshold value`() {
        // Arrange
        val threshold = MetricThreshold(min = 0, max = 100)

        // Act
        val atMin = threshold.isViolated(0)
        val belowMin = threshold.isViolated(-1)

        // Assert
        assertThat(atMin).isFalse()
        assertThat(belowMin).isTrue()
    }

    @Test
    fun `should handle very large numbers`() {
        // Arrange
        val threshold = MetricThreshold(max = 1_000_000)

        // Act
        val isViolated = threshold.isViolated(1_000_001)

        // Assert
        assertThat(isViolated).isTrue()
    }

    @Test
    fun `should return BELOW_MIN violation type when value is below min`() {
        // Arrange
        val threshold = MetricThreshold(min = 50)

        // Act
        val violationType = threshold.getViolationType(30)

        // Assert
        assertThat(violationType).isEqualTo(ViolationType.BELOW_MIN)
    }

    @Test
    fun `should return ABOVE_MAX violation type when value is above max`() {
        // Arrange
        val threshold = MetricThreshold(max = 100)

        // Act
        val violationType = threshold.getViolationType(150)

        // Assert
        assertThat(violationType).isEqualTo(ViolationType.ABOVE_MAX)
    }

    @Test
    fun `should return null violation type when value is within range`() {
        // Arrange
        val threshold = MetricThreshold(min = 10, max = 100)

        // Act
        val violationType = threshold.getViolationType(50)

        // Assert
        assertThat(violationType).isNull()
    }

    @Test
    fun `should return null violation type when value equals threshold`() {
        // Arrange
        val thresholdMin = MetricThreshold(min = 50)
        val thresholdMax = MetricThreshold(max = 100)

        // Act
        val violationTypeMin = thresholdMin.getViolationType(50)
        val violationTypeMax = thresholdMax.getViolationType(100)

        // Assert
        assertThat(violationTypeMin).isNull()
        assertThat(violationTypeMax).isNull()
    }

    @Test
    fun `should prioritize min violation when both thresholds are violated`() {
        // Arrange
        val threshold = MetricThreshold(min = 50, max = 100)

        // Act
        val violationType = threshold.getViolationType(30)

        // Assert
        assertThat(violationType).isEqualTo(ViolationType.BELOW_MIN)
    }

    @Test
    fun `should return min value for BELOW_MIN violation type`() {
        // Arrange
        val threshold = MetricThreshold(min = 50, max = 100)

        // Act
        val thresholdValue = threshold.getThresholdValue(ViolationType.BELOW_MIN)

        // Assert
        assertThat(thresholdValue).isEqualTo(50)
    }

    @Test
    fun `should return max value for ABOVE_MAX violation type`() {
        // Arrange
        val threshold = MetricThreshold(min = 50, max = 100)

        // Act
        val thresholdValue = threshold.getThresholdValue(ViolationType.ABOVE_MAX)

        // Assert
        assertThat(thresholdValue).isEqualTo(100)
    }

    @Test
    fun `should handle integer values for thresholds with decimal input`() {
        // Arrange
        val threshold = MetricThreshold(min = 10, max = 100)

        // Act
        val isViolated = threshold.isViolated(50.5)

        // Assert
        assertThat(isViolated).isFalse()
    }
}
