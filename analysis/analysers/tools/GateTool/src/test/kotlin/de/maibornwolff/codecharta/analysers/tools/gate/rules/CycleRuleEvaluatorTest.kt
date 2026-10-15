package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.analysers.tools.gate.config.CycleRule
import de.maibornwolff.codecharta.analysers.tools.gate.config.CycleRules
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CycleRuleEvaluatorTest {
    private val fileRule = CycleRule(Severity.ERROR, "Break the cycle.")
    private val upwardRule = CycleRule(Severity.WARNING, "Turn the dependency around.")

    @Test
    fun `should report each file cycle the dependency parser marked, once, with its members`() {
        // Arrange
        val dependencies = listOf(cyclic("a/Foo.kt", "b/Bar.kt"), cyclic("b/Bar.kt", "a/Foo.kt"), regular("a/Foo.kt", "c/Leaf.kt"))

        // Act
        val violations = CycleRuleEvaluator(CycleRules(file = fileRule)).evaluate(dependencies)

        // Assert
        assertThat(violations).containsExactly(
            Violation(
                ViolationKind.FILE_CYCLE,
                Severity.ERROR,
                "Break the cycle.",
                members = listOf("a/Foo.kt", "b/Bar.kt"),
                dependencies = mapOf("a/Foo.kt" to listOf("b/Bar.kt"), "b/Bar.kt" to listOf("a/Foo.kt"))
            )
        )
    }

    @Test
    fun `should not report files that depend on each other when the dependency parser did not mark a cycle`() {
        // Arrange
        val dependencies = listOf(regular("a/Foo.kt", "b/Bar.kt"), regular("b/Bar.kt", "a/Foo.kt"))

        // Act
        val violations = CycleRuleEvaluator(CycleRules(file = fileRule)).evaluate(dependencies)

        // Assert
        assertThat(violations).isEmpty()
    }

    @Test
    fun `should list for each member only the marked dependencies of its own cycle`() {
        // Arrange
        val dependencies =
            listOf(
                cyclic("Foo.kt", "Bar.kt"),
                cyclic("Foo.kt", "Baz.kt"),
                cyclic("Bar.kt", "Foo.kt"),
                cyclic("Baz.kt", "Foo.kt"),
                regular("Foo.kt", "Outside.kt")
            )

        // Act
        val violations = CycleRuleEvaluator(CycleRules(file = fileRule)).evaluate(dependencies)

        // Assert
        assertThat(violations.single().dependencies).isEqualTo(
            mapOf("Bar.kt" to listOf("Foo.kt"), "Baz.kt" to listOf("Foo.kt"), "Foo.kt" to listOf("Bar.kt", "Baz.kt"))
        )
    }

    @Test
    fun `should not report a cycle that only exists through an ignored file`() {
        // Arrange
        val dependencies =
            listOf(
                cyclic("a/Foo.kt", "b/Bar.kt"),
                cyclic("b/Bar.kt", "a/Foo.kt"),
                cyclic("c/One.kt", "c/Two.kt"),
                cyclic("c/Two.kt", "c/One.kt")
            )
        val rules = CycleRules(file = fileRule.copy(ignore = listOf("b/Bar.kt")))

        // Act
        val violations = CycleRuleEvaluator(rules).evaluate(dependencies)

        // Assert
        assertThat(violations.map { it.members }).containsExactly(listOf("c/One.kt", "c/Two.kt"))
    }

    @Test
    fun `should still report the part of a cycle that does not run through the ignored file`() {
        // Arrange
        val dependencies =
            listOf(cyclic("Foo.kt", "Bar.kt"), cyclic("Bar.kt", "Baz.kt"), cyclic("Baz.kt", "Foo.kt"), cyclic("Foo.kt", "Baz.kt"))
        val rules = CycleRules(file = fileRule.copy(ignore = listOf("Bar.kt")))

        // Act
        val violations = CycleRuleEvaluator(rules).evaluate(dependencies)

        // Assert
        assertThat(violations.single().members).containsExactly("Baz.kt", "Foo.kt")
    }

    @Test
    fun `should leave out every file a pattern matches`() {
        // Arrange
        val dependencies = listOf(cyclic("generated/A.kt", "generated/B.kt"), cyclic("generated/B.kt", "generated/A.kt"))
        val rules = CycleRules(file = fileRule.copy(ignore = listOf("generated/")))

        // Act
        val violations = CycleRuleEvaluator(rules).evaluate(dependencies)

        // Assert
        assertThat(violations).isEmpty()
    }

    @Test
    fun `should report every dependency the dependency parser marked as pointing upwards`() {
        // Arrange
        val dependencies = listOf(upward("src/a/One.kt", "src/b/Two.kt"), regular("src/b/Three.kt", "src/a/Four.kt"))

        // Act
        val violations = CycleRuleEvaluator(CycleRules(upward = upwardRule)).evaluate(dependencies)

        // Assert
        assertThat(violations).containsExactly(
            Violation(
                ViolationKind.UPWARD_DEPENDENCY,
                Severity.WARNING,
                "Turn the dependency around.",
                path = "src/a/One.kt",
                target = "src/b/Two.kt"
            )
        )
    }

    @Test
    fun `should leave out upward dependencies from or to an ignored folder`() {
        // Arrange
        val dependencies = listOf(upward("src/a/One.kt", "src/legacy/Two.kt"), upward("src/legacy/Three.kt", "src/a/Four.kt"))
        val rules = CycleRules(upward = upwardRule.copy(ignore = listOf("src/legacy")))

        // Act
        val violations = CycleRuleEvaluator(rules).evaluate(dependencies)

        // Assert
        assertThat(violations).isEmpty()
    }

    @Test
    fun `should check nothing when no dependency rule is set`() {
        // Arrange
        val dependencies = listOf(cyclic("a/Foo.kt", "b/Bar.kt"), cyclic("b/Bar.kt", "a/Foo.kt"), upward("a/Foo.kt", "c/Baz.kt"))

        // Act
        val violations = CycleRuleEvaluator(CycleRules()).evaluate(dependencies)

        // Assert
        assertThat(violations).isEmpty()
    }

    @Test
    fun `should warn once that dependencies could not be checked when the map has no dependency analysis`() {
        // Arrange
        val rules = CycleRules(file = fileRule, upward = upwardRule)

        // Act
        val violations = CycleRuleEvaluator(rules).evaluate(emptyList(), hasDependencyAnalysis = false)

        // Assert
        assertThat(violations).containsExactly(
            Violation(
                ViolationKind.CYCLES_NOT_CHECKED,
                Severity.WARNING,
                "The map has no dependency analysis, so cycles and upward dependencies could not be checked. " +
                    "Switch on the dependencyparser and leave out its --omit-graph-analysis."
            )
        )
    }

    @Test
    fun `should not warn about a missing dependency analysis when no dependency rule is set`() {
        // Arrange
        val rules = CycleRules()

        // Act
        val violations = CycleRuleEvaluator(rules).evaluate(emptyList(), hasDependencyAnalysis = false)

        // Assert
        assertThat(violations).isEmpty()
    }

    private fun regular(from: String, to: String) = FileDependency(from, to)

    private fun cyclic(from: String, to: String) = FileDependency(from, to, isCyclic = true)

    private fun upward(from: String, to: String) = FileDependency(from, to, isPointingUpwards = true)
}
