package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import java.io.ByteArrayOutputStream
import java.io.PrintStream

// Note: Cannot test violation scenarios that call exitProcess(1) without
// mocking System.exit, which would require additional infrastructure.
// The violation detection logic is thoroughly tested in ThresholdValidatorTest.
class MetricThresholdCheckerTest {
    private val resourcePath = "src/test/resources"

    @Test
    fun `should throw exception when input path is null`() {
        // Arrange
        val outputStream = ByteArrayOutputStream()
        val errorStream = ByteArrayOutputStream()
        val checker = MetricThresholdChecker(PrintStream(outputStream), PrintStream(errorStream))

        // Act & Assert
        assertThatThrownBy {
            checker.call()
        }.isInstanceOf(IllegalArgumentException::class.java)
            .hasMessageContaining("Input path is invalid")
    }

    @Test
    fun `should have correct name constant`() {
        // Act
        val name = MetricThresholdChecker.NAME

        // Assert
        assertThat(name).isEqualTo("metricthresholdchecker")
    }

    @Test
    fun `should return correct name from instance`() {
        // Arrange
        val outputStream = ByteArrayOutputStream()
        val errorStream = ByteArrayOutputStream()
        val checker = MetricThresholdChecker(PrintStream(outputStream), PrintStream(errorStream))

        // Act
        val name = checker.name

        // Assert
        assertThat(name).isEqualTo(MetricThresholdChecker.NAME)
    }

    @Test
    fun `should complete successfully when all thresholds pass`() {
        // Arrange
        val outputStream = ByteArrayOutputStream()
        val errorStream = ByteArrayOutputStream()
        val args = arrayOf(
            "$resourcePath/sample-code",
            "--config",
            "$resourcePath/config/test-config-pass.json"
        )

        // Act
        MetricThresholdChecker.mainWithOutputStream(
            PrintStream(outputStream),
            PrintStream(errorStream),
            args
        )

        // Assert
        val errorOutput = errorStream.toString()
        assertThat(errorOutput).contains("✓ All checks passed!")
    }

    @Test
    fun `should respect exclude patterns`() {
        // Arrange
        val outputStream = ByteArrayOutputStream()
        val errorStream = ByteArrayOutputStream()
        val args = arrayOf(
            "$resourcePath/sample-code",
            "--config",
            "$resourcePath/config/test-config-pass.json",
            "--exclude",
            ".*Complex.*"
        )

        // Act
        MetricThresholdChecker.mainWithOutputStream(
            PrintStream(outputStream),
            PrintStream(errorStream),
            args
        )

        // Assert
        val errorOutput = errorStream.toString()
        assertThat(errorOutput).contains("All checks passed")
    }

    @Test
    fun `should respect file extension filter`() {
        // Arrange
        val outputStream = ByteArrayOutputStream()
        val errorStream = ByteArrayOutputStream()
        val args = arrayOf(
            "$resourcePath/sample-code",
            "--config",
            "$resourcePath/config/test-config-pass.json",
            "--file-extensions",
            "java"
        )

        // Act
        MetricThresholdChecker.mainWithOutputStream(
            PrintStream(outputStream),
            PrintStream(errorStream),
            args
        )

        // Assert
        val errorOutput = errorStream.toString()
        assertThat(errorOutput).contains("All checks passed")
    }

    @Test
    fun `should print verbose output when verbose flag is set`() {
        // Arrange
        val outputStream = ByteArrayOutputStream()
        val errorStream = ByteArrayOutputStream()
        val args = arrayOf(
            "$resourcePath/sample-code",
            "--config",
            "$resourcePath/config/test-config-pass.json",
            "--verbose"
        )

        // Act
        MetricThresholdChecker.mainWithOutputStream(
            PrintStream(outputStream),
            PrintStream(errorStream),
            args
        )

        // Assert
        val errorOutput = errorStream.toString()
        assertThat(errorOutput).contains("Analyzing project at:")
    }

    @Test
    fun `should handle bypass gitignore flag`() {
        // Arrange
        val outputStream = ByteArrayOutputStream()
        val errorStream = ByteArrayOutputStream()
        val args = arrayOf(
            "$resourcePath/sample-code",
            "--config",
            "$resourcePath/config/test-config-pass.json",
            "--bypass-gitignore"
        )

        // Act
        MetricThresholdChecker.mainWithOutputStream(
            PrintStream(outputStream),
            PrintStream(errorStream),
            args
        )

        // Assert
        val errorOutput = errorStream.toString()
        assertThat(errorOutput).contains("All checks passed")
    }

    @Test
    fun `should return false for isApplicable`() {
        // Arrange
        val checker = MetricThresholdChecker()

        // Act
        val isApplicable = checker.isApplicable("any-resource")

        // Assert
        assertThat(isApplicable).isFalse()
    }

    @Test
    fun `should have correct description`() {
        // Assert
        assertThat(MetricThresholdChecker.DESCRIPTION)
            .contains("validates code metrics")
            .contains("thresholds")
    }

    @Test
    fun `should provide dialog interface`() {
        // Arrange
        val checker = MetricThresholdChecker()

        // Act
        val dialog = checker.getDialog()

        // Assert
        assertThat(dialog).isNotNull
    }

    @Test
    fun `should handle directory with no parsable files`() {
        // Arrange
        val outputStream = ByteArrayOutputStream()
        val errorStream = ByteArrayOutputStream()
        val args = arrayOf(
            "$resourcePath/sample-code",
            "--config",
            "$resourcePath/config/test-config-pass.json",
            "--file-extensions",
            "cpp"
        )

        // Act
        MetricThresholdChecker.mainWithOutputStream(
            PrintStream(outputStream),
            PrintStream(errorStream),
            args
        )

        // Assert
        val errorOutput = errorStream.toString()
        assertThat(errorOutput).contains("checks passed")
    }

    @Test
    fun `should analyze single file`() {
        // Arrange
        val outputStream = ByteArrayOutputStream()
        val errorStream = ByteArrayOutputStream()
        val args = arrayOf(
            "$resourcePath/sample-code/SimpleFile.kt",
            "--config",
            "$resourcePath/config/test-config-pass.json"
        )

        // Act
        MetricThresholdChecker.mainWithOutputStream(
            PrintStream(outputStream),
            PrintStream(errorStream),
            args
        )

        // Assert
        val errorOutput = errorStream.toString()
        assertThat(errorOutput).contains("All checks passed")
    }

    @Test
    fun `should handle multiple exclude patterns`() {
        // Arrange
        val outputStream = ByteArrayOutputStream()
        val errorStream = ByteArrayOutputStream()
        val args = arrayOf(
            "$resourcePath/sample-code",
            "--config",
            "$resourcePath/config/test-config-pass.json",
            "--exclude",
            ".*Simple.*,.*Complex.*"
        )

        // Act
        MetricThresholdChecker.mainWithOutputStream(
            PrintStream(outputStream),
            PrintStream(errorStream),
            args
        )

        // Assert
        val errorOutput = errorStream.toString()
        assertThat(errorOutput).contains("All checks passed")
    }

    @Test
    fun `should handle multiple file extensions`() {
        // Arrange
        val outputStream = ByteArrayOutputStream()
        val errorStream = ByteArrayOutputStream()
        val args = arrayOf(
            "$resourcePath/sample-code",
            "--config",
            "$resourcePath/config/test-config-pass.json",
            "--file-extensions",
            "kt,java,scala"
        )

        // Act
        MetricThresholdChecker.mainWithOutputStream(
            PrintStream(outputStream),
            PrintStream(errorStream),
            args
        )

        // Assert
        val errorOutput = errorStream.toString()
        assertThat(errorOutput).contains("All checks passed")
    }
}
