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

class RuleResolverTest {
    private val rlocRule =
        MetricRule(mapOf(Severity.WARNING to LevelRule(200.0, "Plan a split."), Severity.ERROR to LevelRule(400.0, "Split it.")))

    @Test
    fun `should give a file outside every override the global rules`() {
        // Arrange
        val config = GateConfig(metrics = mapOf("rloc" to rlocRule), overrides = listOf(legacyOverride(MetricOverride.Off)))

        // Act
        val rules = RuleResolver(config).rulesFor("src/main/App.kt")

        // Assert
        assertThat(rules).isEqualTo(mapOf("rloc" to rlocRule.levels))
    }

    @Test
    fun `should switch a rule off for the files an override matches`() {
        // Arrange
        val config = GateConfig(metrics = mapOf("rloc" to rlocRule), overrides = listOf(legacyOverride(MetricOverride.Off)))

        // Act
        val rules = RuleResolver(config).rulesFor("src/legacy/old/Big.kt")

        // Assert
        assertThat(rules).isEmpty()
    }

    @Test
    fun `should replace only the limit an override gives and keep the rest of the level`() {
        // Arrange
        val override = MetricOverride.Levels(mapOf(Severity.ERROR to LevelOverride(max = 2000.0)))
        val config = GateConfig(metrics = mapOf("rloc" to rlocRule), overrides = listOf(legacyOverride(override)))

        // Act
        val rules = RuleResolver(config).rulesFor("src/legacy/Big.kt")

        // Assert
        assertThat(rules.getValue("rloc")).isEqualTo(
            mapOf(Severity.WARNING to LevelRule(200.0, "Plan a split."), Severity.ERROR to LevelRule(2000.0, "Split it."))
        )
    }

    @Test
    fun `should let the last matching override win`() {
        // Arrange
        val loosen = MetricOverride.Levels(mapOf(Severity.ERROR to LevelOverride(max = 2000.0)))
        val tighten = MetricOverride.Levels(mapOf(Severity.ERROR to LevelOverride(max = 100.0)))
        val config =
            GateConfig(
                metrics = mapOf("rloc" to rlocRule),
                overrides = listOf(legacyOverride(loosen), PathOverride(listOf("*.kt"), mapOf("rloc" to tighten)))
            )

        // Act
        val rules = RuleResolver(config).rulesFor("src/legacy/Big.kt")

        // Assert
        assertThat(rules.getValue("rloc").getValue(Severity.ERROR).max).isEqualTo(100.0)
    }

    @Test
    fun `should add a rule that only exists for the files an override matches`() {
        // Arrange
        val override = MetricOverride.Levels(mapOf(Severity.WARNING to LevelOverride(max = 5.0, instruction = "Keep it small.")))
        val config = GateConfig(overrides = listOf(PathOverride(listOf("**/generated/**"), mapOf("mcc" to override))))

        // Act
        val matched = RuleResolver(config).rulesFor("api/generated/Client.kt")
        val unmatched = RuleResolver(config).rulesFor("api/Client.kt")

        // Assert
        assertThat(matched).isEqualTo(mapOf("mcc" to mapOf(Severity.WARNING to LevelRule(5.0, "Keep it small."))))
        assertThat(unmatched).isEmpty()
    }

    @Test
    fun `should match a folder pattern for every file below that folder`() {
        // Arrange
        val config = GateConfig(
            metrics = mapOf("rloc" to rlocRule),
            overrides = listOf(
                PathOverride(
                    listOf("legacy/"),
                    mapOf(
                        "rloc" to MetricOverride.Off
                    )
                )
            )
        )

        // Act
        val rules = RuleResolver(config).rulesFor("src/legacy/deep/Old.kt")

        // Assert
        assertThat(rules).isEmpty()
    }

    private fun legacyOverride(override: MetricOverride) = PathOverride(listOf("src/legacy/**"), mapOf("rloc" to override))
}
