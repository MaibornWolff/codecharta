package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.analysers.tools.gate.config.CycleRule
import de.maibornwolff.codecharta.analysers.tools.gate.config.CycleRules
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CycleRuleEvaluatorTest {
    private val fileRule = CycleRule(Severity.ERROR, "Break the cycle.")
    private val packageRule = CycleRule(Severity.WARNING, "Untangle the packages.")

    @Test
    fun `should report each file cycle once with its members`() {
        // Arrange
        val dependencies =
            listOf(dependency("a/Foo.kt", "b/Bar.kt"), dependency("b/Bar.kt", "a/Foo.kt"), dependency("a/Foo.kt", "c/Leaf.kt"))

        // Act
        val violations = CycleRuleEvaluator(CycleRules(file = fileRule)).evaluate(dependencies)

        // Assert
        assertThat(violations).containsExactly(
            Violation(ViolationKind.FILE_CYCLE, Severity.ERROR, "Break the cycle.", members = listOf("a/Foo.kt", "b/Bar.kt"))
        )
    }

    @Test
    fun `should report a package cycle between the folders of files that do not form a file cycle`() {
        // Arrange
        val dependencies = listOf(dependency("a/One.kt", "b/Two.kt"), dependency("b/Three.kt", "a/Four.kt"))

        // Act
        val violations = CycleRuleEvaluator(CycleRules(file = fileRule, packages = packageRule)).evaluate(dependencies)

        // Assert
        assertThat(violations).containsExactly(
            Violation(ViolationKind.PACKAGE_CYCLE, Severity.WARNING, "Untangle the packages.", members = listOf("a", "b"))
        )
    }

    @Test
    fun `should name the top folder of the project as a dot`() {
        // Arrange
        val dependencies = listOf(dependency("Main.kt", "lib/Util.kt"), dependency("lib/Util.kt", "Config.kt"))

        // Act
        val violations = CycleRuleEvaluator(CycleRules(packages = packageRule)).evaluate(dependencies)

        // Assert
        assertThat(violations.single().members).containsExactly(".", "lib")
    }

    @Test
    fun `should skip a cycle the config allows`() {
        // Arrange
        val dependencies = listOf(dependency("a/Foo.kt", "b/Bar.kt"), dependency("b/Bar.kt", "a/Foo.kt"))
        val rules = CycleRules(file = fileRule, packages = packageRule, allowed = listOf(setOf("b/Bar.kt", "a/Foo.kt"), setOf("a", "b")))

        // Act
        val violations = CycleRuleEvaluator(rules).evaluate(dependencies)

        // Assert
        assertThat(violations).isEmpty()
    }

    @Test
    fun `should still report an allowed cycle once it grows`() {
        // Arrange
        val dependencies = listOf(dependency("Foo.kt", "Bar.kt"), dependency("Bar.kt", "Baz.kt"), dependency("Baz.kt", "Foo.kt"))
        val rules = CycleRules(file = fileRule, allowed = listOf(setOf("Foo.kt", "Bar.kt")))

        // Act
        val violations = CycleRuleEvaluator(rules).evaluate(dependencies)

        // Assert
        assertThat(violations.single().members).containsExactly("Bar.kt", "Baz.kt", "Foo.kt")
    }

    @Test
    fun `should check no cycles when no cycle rule is set`() {
        // Arrange
        val dependencies = listOf(dependency("a/Foo.kt", "b/Bar.kt"), dependency("b/Bar.kt", "a/Foo.kt"))

        // Act
        val violations = CycleRuleEvaluator(CycleRules()).evaluate(dependencies)

        // Assert
        assertThat(violations).isEmpty()
    }

    private fun dependency(from: String, to: String) = FileDependency(from, to)
}
