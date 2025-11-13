package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.renderers

import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.MetricThreshold
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.ThresholdConfiguration
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.ThresholdViolation
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.ViolationType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class SummaryRendererTest {
    @Test
    fun `should render success summary when no violations`() {
        // Arrange
        val renderer = SummaryRenderer()
        val config = ThresholdConfiguration(
            fileMetrics = mapOf(
                "rloc" to MetricThreshold(max = 100),
                "mcc" to MetricThreshold(max = 10)
            )
        )

        // Act
        val result = renderer.render(emptyList(), config)

        // Assert
        assertThat(result).contains("All checks passed!")
        assertThat(result).contains("Checked 2 threshold(s)")
        assertThat(result).contains("Metric Threshold Check Results")
    }

    @Test
    fun `should render failure summary when violations exist`() {
        // Arrange
        val renderer = SummaryRenderer()
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
        val result = renderer.render(violations, config)

        // Assert
        assertThat(result).contains("2 violation(s) found!")
        assertThat(result).contains("Metric Threshold Check Results")
        assertThat(result).doesNotContain("All checks passed!")
    }

    @Test
    fun `should include correct threshold count`() {
        // Arrange
        val renderer = SummaryRenderer()
        val config = ThresholdConfiguration(
            fileMetrics = mapOf(
                "rloc" to MetricThreshold(max = 100),
                "mcc" to MetricThreshold(max = 10),
                "coverage" to MetricThreshold(min = 80)
            )
        )

        // Act
        val result = renderer.render(emptyList(), config)

        // Assert
        assertThat(result).contains("Checked 3 threshold(s)")
    }

    @Test
    fun `should render summary with single threshold`() {
        // Arrange
        val renderer = SummaryRenderer()
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 100))
        )

        // Act
        val result = renderer.render(emptyList(), config)

        // Assert
        assertThat(result).contains("Checked 1 threshold(s)")
    }

    @Test
    fun `should include header separators`() {
        // Arrange
        val renderer = SummaryRenderer()
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 100))
        )

        // Act
        val result = renderer.render(emptyList(), config)

        // Assert
        assertThat(result).contains("═")
    }
}
