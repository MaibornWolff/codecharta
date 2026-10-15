package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.analysers.tools.gate.config.CycleRule
import de.maibornwolff.codecharta.analysers.tools.gate.config.CycleRules
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CycleRuleEvaluatorTest {
    private val cycleRule = CycleRule(Severity.ERROR, "Break the cycle.")
    private val upwardRule = CycleRule(Severity.WARNING, "Turn the dependency around.")
    private val foo = Declaration("a/Foo.kt", "Foo")
    private val bar = Declaration("b/Bar.kt", "Bar")
    private val baz = Declaration("b/Bar.kt", "Baz")

    @Test
    fun `should report a cycle between files with the declarations it runs through`() {
        // Arrange
        val analysis = DependencyAnalysis(listOf(cyclic(foo, bar), cyclic(bar, foo)))

        // Act
        val violations = CycleRuleEvaluator(CycleRules(betweenFiles = cycleRule)).evaluate(analysis)

        // Assert
        assertThat(violations).containsExactly(
            CycleViolation(Severity.ERROR, "Break the cycle.", listOf(foo, bar))
        )
    }

    @Test
    fun `should report a cycle inside one file only under its own rule`() {
        // Arrange
        val analysis = DependencyAnalysis(listOf(cyclic(bar, baz), cyclic(baz, bar)))

        // Act
        val betweenFilesOnly = CycleRuleEvaluator(CycleRules(betweenFiles = cycleRule)).evaluate(analysis)
        val insideFiles = CycleRuleEvaluator(CycleRules(insideFiles = cycleRule)).evaluate(analysis)

        // Assert
        assertThat(betweenFilesOnly).isEmpty()
        assertThat(insideFiles).containsExactly(
            CycleViolation(Severity.ERROR, "Break the cycle.", listOf(bar, baz))
        )
    }

    @Test
    fun `should not report a cycle that runs through an ignored file`() {
        // Arrange
        val other = Declaration("c/Other.kt", "Other")
        val analysis = DependencyAnalysis(listOf(cyclic(foo, bar), cyclic(bar, foo), cyclic(foo, other), cyclic(other, foo)))
        val rules = CycleRules(betweenFiles = cycleRule.copy(ignore = listOf("b/")))

        // Act
        val violations = CycleRuleEvaluator(rules).evaluate(analysis)

        // Assert
        assertThat(violations.map { (it as CycleViolation).files }).containsExactly(listOf("a/Foo.kt", "c/Other.kt"))
    }

    @Test
    fun `should report each upward dependency between declarations with its files`() {
        // Arrange
        val analysis = DependencyAnalysis(listOf(plain(foo, bar), plain(bar, foo)), mapOf(("a/Foo.kt" to "b/Bar.kt") to true))

        // Act
        val violations = CycleRuleEvaluator(CycleRules(upward = upwardRule)).evaluate(analysis)

        // Assert
        assertThat(violations).containsExactly(
            UpwardViolation(Severity.WARNING, "Turn the dependency around.", foo, bar)
        )
    }

    @Test
    fun `should report an upward dependency inside one file`() {
        // Arrange
        val analysis = DependencyAnalysis(listOf(DeclarationDependency(bar, baz, isPointingUpwards = true)))

        // Act
        val violations = CycleRuleEvaluator(CycleRules(upward = upwardRule)).evaluate(analysis)

        // Assert
        assertThat(violations.single()).isEqualTo(UpwardViolation(Severity.WARNING, "Turn the dependency around.", bar, baz))
    }

    @Test
    fun `should leave out upward dependencies from or to an ignored folder`() {
        // Arrange
        val analysis = DependencyAnalysis(listOf(plain(foo, bar)), mapOf(("a/Foo.kt" to "b/Bar.kt") to true))
        val rules = CycleRules(upward = upwardRule.copy(ignore = listOf("b")))

        // Act
        val violations = CycleRuleEvaluator(rules).evaluate(analysis)

        // Assert
        assertThat(violations).isEmpty()
    }

    @Test
    fun `should check nothing when no dependency rule is set`() {
        // Arrange
        val analysis = DependencyAnalysis(listOf(cyclic(foo, bar), cyclic(bar, foo)), mapOf(("a/Foo.kt" to "b/Bar.kt") to true))

        // Act
        val violations = CycleRuleEvaluator(CycleRules()).evaluate(analysis)

        // Assert
        assertThat(violations).isEmpty()
    }

    @Test
    fun `should warn once that dependencies could not be checked when the map has no dependency analysis`() {
        // Arrange
        val rules = CycleRules(betweenFiles = cycleRule, insideFiles = cycleRule, upward = upwardRule)

        // Act
        val violations = CycleRuleEvaluator(rules).evaluate(null)

        // Assert
        assertThat(violations).containsExactly(
            DependenciesNotChecked(
                Severity.WARNING,
                "Cycles and upward dependencies could not be checked: the map has no dependency analysis. The dependencyparser " +
                    "is switched off, found no source code it supports, or ran with --omit-graph-analysis."
            )
        )
    }

    @Test
    fun `should not warn about a missing dependency analysis when no dependency rule is set`() {
        // Arrange
        val rules = CycleRules()

        // Act
        val violations = CycleRuleEvaluator(rules).evaluate(null)

        // Assert
        assertThat(violations).isEmpty()
    }

    private fun cyclic(from: Declaration, to: Declaration) = DeclarationDependency(from, to, isCyclic = true)

    private fun plain(from: Declaration, to: Declaration) = DeclarationDependency(from, to)
}
