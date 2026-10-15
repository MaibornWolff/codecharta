package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.analysers.tools.gate.config.LevelOverride
import de.maibornwolff.codecharta.analysers.tools.gate.config.LevelRule
import de.maibornwolff.codecharta.analysers.tools.gate.config.MetricOverride
import de.maibornwolff.codecharta.analysers.tools.gate.config.MetricRule
import de.maibornwolff.codecharta.analysers.tools.gate.config.PathOverride
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class MetricRuleEvaluatorTest {
    private val config =
        GateConfig(
            metrics =
                mapOf(
                    "rloc" to
                        MetricRule(
                            mapOf(
                                Severity.WARNING to LevelRule(200.0, "Plan a split."),
                                Severity.ERROR to LevelRule(400.0, "Split it.")
                            )
                        )
                )
        )

    @Test
    fun `should report a file above the error limit once, as an error`() {
        // Arrange
        val files = listOf(AnalysedFile("src/Big.kt", mapOf("rloc" to 812.0)))

        // Act
        val violations = MetricRuleEvaluator(config).evaluate(files)

        // Assert
        assertThat(violations).containsExactly(
            Violation(
                ViolationKind.METRIC,
                Severity.ERROR,
                "Split it.",
                path = "src/Big.kt",
                metric = "rloc",
                value = 812.0,
                threshold = 400.0
            )
        )
    }

    @Test
    fun `should report a file between the limits as a warning`() {
        // Arrange
        val files = listOf(AnalysedFile("src/Mid.kt", mapOf("rloc" to 263.0)))

        // Act
        val violations = MetricRuleEvaluator(config).evaluate(files)

        // Assert
        assertThat(violations.single().severity).isEqualTo(Severity.WARNING)
        assertThat(violations.single().threshold).isEqualTo(200.0)
    }

    @Test
    fun `should not report a file exactly at a limit`() {
        // Arrange
        val files = listOf(AnalysedFile("src/Edge.kt", mapOf("rloc" to 200.0)))

        // Act
        val violations = MetricRuleEvaluator(config).evaluate(files)

        // Assert
        assertThat(violations).isEmpty()
    }

    @Test
    fun `should not check a file that lacks the metric`() {
        // Arrange
        val files = listOf(AnalysedFile("README.md", mapOf("word_count" to 900.0)), AnalysedFile("src/Big.kt", mapOf("rloc" to 10.0)))

        // Act
        val violations = MetricRuleEvaluator(config).evaluate(files)

        // Assert
        assertThat(violations).isEmpty()
    }

    @Test
    fun `should apply the limits an override gives the file`() {
        // Arrange
        val loosened = MetricOverride.Levels(
            mapOf(
                Severity.ERROR to LevelOverride(max = 2000.0),
                Severity.WARNING to LevelOverride(max = 1000.0)
            )
        )
        val configWithOverride = config.copy(overrides = listOf(PathOverride(listOf("legacy/**"), mapOf("rloc" to loosened))))
        val files = listOf(AnalysedFile("legacy/Big.kt", mapOf("rloc" to 812.0)))

        // Act
        val violations = MetricRuleEvaluator(configWithOverride).evaluate(files)

        // Assert
        assertThat(violations).isEmpty()
    }

    @Test
    fun `should warn about a rule for a metric no file has`() {
        // Arrange
        val files = listOf(AnalysedFile("src/Big.kt", mapOf("complexity" to 3.0)))

        // Act
        val violations = MetricRuleEvaluator(config).evaluate(files)

        // Assert
        assertThat(violations).containsExactly(
            Violation(
                ViolationKind.UNKNOWN_METRIC,
                Severity.WARNING,
                "The analysis produced no metric named 'rloc'. Check the name, or switch on the analyser that measures it.",
                metric = "rloc"
            )
        )
    }
}
