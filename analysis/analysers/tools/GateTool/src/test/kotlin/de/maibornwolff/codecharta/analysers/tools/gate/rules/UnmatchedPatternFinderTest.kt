package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.analysers.tools.gate.config.DependencyRule
import de.maibornwolff.codecharta.analysers.tools.gate.config.DependencyRules
import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.analysers.tools.gate.config.MetricOverride
import de.maibornwolff.codecharta.analysers.tools.gate.config.PathOverride
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class UnmatchedPatternFinderTest {
    private val filePaths = listOf("src/main/App.kt", "src/legacy/Old.kt")

    @Test
    fun `should warn about each pattern that matches no file, naming the setting it is in`() {
        // Arrange
        val config =
            GateConfig(
                exclude = listOf("./src/legacy/**", "**/legacy/**"),
                dependencies = DependencyRules(upward = DependencyRule(Severity.WARNING, ignore = listOf("generated/"))),
                overrides = listOf(PathOverride(listOf("src/main/**", "src\\main\\**"), mapOf("rloc" to MetricOverride.Off)))
            )

        // Act
        val violations = UnmatchedPatternFinder(filePaths).find(config)

        // Assert
        assertThat(violations.map { (it as UnmatchedPattern).setting to it.pattern }).containsExactly(
            "exclude" to "./src/legacy/**",
            "dependencies.upward.ignore" to "generated/",
            "overrides[0].paths" to "src\\main\\**"
        )
        assertThat(violations).allMatch { it.severity == Severity.WARNING }
    }

    @Test
    fun `should not ask a negated pattern to match anything`() {
        // Arrange
        val config = GateConfig(exclude = listOf("src/**", "!src/keep/**"))

        // Act
        val violations = UnmatchedPatternFinder(filePaths).find(config)

        // Assert
        assertThat(violations).isEmpty()
    }
}
