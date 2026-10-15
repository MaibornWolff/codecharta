package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class GateResultTest {
    private val config = GateConfig(exitCodes = mapOf(Severity.ERROR to 1, Severity.WARNING to 3))

    @Test
    fun `should exit with the code of the worst severity found, however the codes are numbered`() {
        // Arrange
        val result = GateResult(listOf(finding(Severity.WARNING), finding(Severity.ERROR)), filesChecked = 2)

        // Act
        val exitCode = result.exitCode(config)

        // Assert
        assertThat(exitCode).isEqualTo(1)
    }

    @Test
    fun `should exit with the code of warnings when only warnings were found`() {
        // Arrange
        val result = GateResult(listOf(finding(Severity.WARNING)), filesChecked = 1)

        // Act
        val exitCode = result.exitCode(config)

        // Assert
        assertThat(exitCode).isEqualTo(3)
    }

    @Test
    fun `should exit with 0 when nothing was found`() {
        // Arrange
        val result = GateResult(emptyList(), filesChecked = 1)

        // Act
        val exitCode = result.exitCode(config)

        // Assert
        assertThat(exitCode).isZero()
    }

    private fun finding(severity: Severity) = UnknownMetric(severity, null, "rloc")
}
