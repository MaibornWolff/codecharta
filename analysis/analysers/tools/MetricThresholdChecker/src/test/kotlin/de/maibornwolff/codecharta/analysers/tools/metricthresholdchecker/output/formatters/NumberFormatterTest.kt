package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class NumberFormatterTest {
    @Test
    fun `should format integer without decimals`() {
        // Arrange
        val formatter = NumberFormatter()
        val value = 100

        // Act
        val result = formatter.format(value)

        // Assert
        assertThat(result).isEqualTo("100")
    }

    @Test
    fun `should format double that is whole number without decimals`() {
        // Arrange
        val formatter = NumberFormatter()
        val value = 200.0

        // Act
        val result = formatter.format(value)

        // Assert
        assertThat(result).isEqualTo("200")
    }

    @Test
    fun `should format decimal with two decimal places using round-half-up`() {
        // Arrange
        val formatter = NumberFormatter()
        val value = 75.567

        // Act
        val result = formatter.format(value)

        // Assert
        assertThat(result).matches("75[.,]57")
    }

    @Test
    fun `should format long without decimals`() {
        // Arrange
        val formatter = NumberFormatter()
        val value = 1000L

        // Act
        val result = formatter.format(value)

        // Assert
        assertThat(result).isEqualTo("1000")
    }

    @Test
    fun `should format float with two decimal places`() {
        // Arrange
        val formatter = NumberFormatter()
        val value = 12.5f

        // Act
        val result = formatter.format(value)

        // Assert
        assertThat(result).matches("12[.,]50?")
    }

    @Test
    fun `should format zero without decimals`() {
        // Arrange
        val formatter = NumberFormatter()
        val value = 0

        // Act
        val result = formatter.format(value)

        // Assert
        assertThat(result).isEqualTo("0")
    }

    @Test
    fun `should format negative integer without decimals`() {
        // Arrange
        val formatter = NumberFormatter()
        val value = -50

        // Act
        val result = formatter.format(value)

        // Assert
        assertThat(result).isEqualTo("-50")
    }

    @Test
    fun `should format negative decimal with two decimal places`() {
        // Arrange
        val formatter = NumberFormatter()
        val value = -30.25

        // Act
        val result = formatter.format(value)

        // Assert
        assertThat(result).matches("-30[.,]25")
    }
}
