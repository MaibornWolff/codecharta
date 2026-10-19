package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.analysers.tools.gate.config.AcceptedDependency
import de.maibornwolff.codecharta.analysers.tools.gate.config.DependencyRule
import de.maibornwolff.codecharta.analysers.tools.gate.config.DependencyRules
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class DependencyRuleEvaluatorTest {
    private val cycleRule = DependencyRule(Severity.ERROR, "Break the cycle.")
    private val upwardRule = DependencyRule(Severity.WARNING, "Turn the dependency around.")
    private val foo = Declaration("a/Foo.kt", "Foo")
    private val bar = Declaration("b/Bar.kt", "Bar")
    private val baz = Declaration("b/Bar.kt", "Baz")

    @Test
    fun `should report a cycle between files with the declarations it runs through`() {
        // Arrange
        val analysis = DependencyAnalysis(listOf(cyclic(foo, bar), cyclic(bar, foo)))

        // Act
        val violations = DependencyRuleEvaluator(DependencyRules(cyclesBetweenFiles = cycleRule)).evaluate(analysis)

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
        val betweenFilesOnly = DependencyRuleEvaluator(DependencyRules(cyclesBetweenFiles = cycleRule)).evaluate(analysis)
        val insideFilesOnly = DependencyRuleEvaluator(DependencyRules(cyclesInsideFiles = cycleRule)).evaluate(analysis)

        // Assert
        assertThat(betweenFilesOnly).isEmpty()
        assertThat(insideFilesOnly).containsExactly(
            CycleViolation(Severity.ERROR, "Break the cycle.", listOf(bar, baz))
        )
    }

    @Test
    fun `should not report a cycle that runs through an ignored file`() {
        // Arrange
        val other = Declaration("c/Other.kt", "Other")
        val analysis = DependencyAnalysis(listOf(cyclic(foo, bar), cyclic(bar, foo), cyclic(foo, other), cyclic(other, foo)))
        val rules = DependencyRules(cyclesBetweenFiles = cycleRule.copy(ignore = listOf("b/")))

        // Act
        val violations = DependencyRuleEvaluator(rules).evaluate(analysis)

        // Assert
        assertThat(violations.map { (it as CycleViolation).files }).containsExactly(listOf("a/Foo.kt", "c/Other.kt"))
    }

    @Test
    fun `should report each upward dependency between declarations with its files`() {
        // Arrange
        val analysis = DependencyAnalysis(listOf(plain(foo, bar), plain(bar, foo)), mapOf(("a/Foo.kt" to "b/Bar.kt") to true))

        // Act
        val violations = DependencyRuleEvaluator(DependencyRules(upward = upwardRule)).evaluate(analysis)

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
        val violations = DependencyRuleEvaluator(DependencyRules(upward = upwardRule)).evaluate(analysis)

        // Assert
        assertThat(violations.single()).isEqualTo(UpwardViolation(Severity.WARNING, "Turn the dependency around.", bar, baz))
    }

    @Test
    fun `should leave out upward dependencies from or to an ignored folder`() {
        // Arrange
        val analysis = DependencyAnalysis(listOf(plain(foo, bar)), mapOf(("a/Foo.kt" to "b/Bar.kt") to true))
        val rules = DependencyRules(upward = upwardRule.copy(ignore = listOf("b")))

        // Act
        val violations = DependencyRuleEvaluator(rules).evaluate(analysis)

        // Assert
        assertThat(violations).isEmpty()
    }

    @Test
    fun `should check nothing when no dependency rule is set`() {
        // Arrange
        val analysis = DependencyAnalysis(listOf(cyclic(foo, bar), cyclic(bar, foo)), mapOf(("a/Foo.kt" to "b/Bar.kt") to true))

        // Act
        val violations = DependencyRuleEvaluator(DependencyRules()).evaluate(analysis)

        // Assert
        assertThat(violations).isEmpty()
    }

    @Test
    fun `should warn once that dependencies could not be checked when the map has no dependency analysis`() {
        // Arrange
        val rules = DependencyRules(cyclesBetweenFiles = cycleRule, cyclesInsideFiles = cycleRule, upward = upwardRule)

        // Act
        val violations = DependencyRuleEvaluator(rules).evaluate(null)

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
        val rules = DependencyRules()

        // Act
        val violations = DependencyRuleEvaluator(rules).evaluate(null)

        // Assert
        assertThat(violations).isEmpty()
    }

    @Test
    fun `should not report a cycle between files that an entry accepts by its files in any order`() {
        // Arrange
        val other = Declaration("c/Other.kt", "Other")
        val analysis = DependencyAnalysis(listOf(cyclic(foo, bar), cyclic(bar, foo), cyclic(foo, other), cyclic(other, foo)))
        val rules = DependencyRules(cyclesBetweenFiles = cycleRule.copy(accept = listOf(accepted("b/Bar.kt", "a/Foo.kt"))))

        // Act
        val violations = DependencyRuleEvaluator(rules).evaluate(analysis)

        // Assert
        assertThat(violations.map { (it as CycleViolation).files }).containsExactly(listOf("a/Foo.kt", "c/Other.kt"))
    }

    @Test
    fun `should not report a cycle inside the file an entry accepts`() {
        // Arrange
        val analysis = DependencyAnalysis(listOf(cyclic(bar, baz), cyclic(baz, bar)))
        val rules = DependencyRules(cyclesInsideFiles = cycleRule.copy(accept = listOf(accepted("b/Bar.kt"))))

        // Act
        val violations = DependencyRuleEvaluator(rules).evaluate(analysis)

        // Assert
        assertThat(violations).isEmpty()
    }

    @Test
    fun `should not report an accepted upward dependency but the one in the other direction`() {
        // Arrange
        val analysis = DependencyAnalysis(
            listOf(plain(foo, bar), plain(bar, foo)),
            mapOf(("a/Foo.kt" to "b/Bar.kt") to true, ("b/Bar.kt" to "a/Foo.kt") to true)
        )
        val rules = DependencyRules(upward = upwardRule.copy(accept = listOf(accepted("a/Foo.kt", "b/Bar.kt"))))

        // Act
        val violations = DependencyRuleEvaluator(rules).evaluate(analysis)

        // Assert
        assertThat(violations).containsExactly(UpwardViolation(Severity.WARNING, "Turn the dependency around.", bar, foo))
    }

    @Test
    fun `should warn about each accepted dependency the analysis no longer finds with the setting of its entry`() {
        // Arrange
        val analysis = DependencyAnalysis(listOf(cyclic(foo, bar), cyclic(bar, foo)))
        val rules = DependencyRules(
            cyclesBetweenFiles = cycleRule.copy(accept = listOf(accepted("a/Foo.kt", "b/Bar.kt"), accepted("a/Foo.kt", "c/Gone.kt"))),
            upward = upwardRule.copy(accept = listOf(accepted("a/Foo.kt", "b/Bar.kt")))
        )

        // Act
        val violations = DependencyRuleEvaluator(rules).evaluate(analysis)

        // Assert
        assertThat(violations).containsExactly(
            StaleAcceptance(
                Severity.WARNING,
                STALE_INSTRUCTION,
                "dependencies.cyclesBetweenFiles.accept[1]",
                listOf("a/Foo.kt", "c/Gone.kt")
            ),
            StaleAcceptance(Severity.WARNING, STALE_INSTRUCTION, "dependencies.upward.accept[0]", listOf("a/Foo.kt", "b/Bar.kt"))
        )
    }

    @Test
    fun `should not call an accepted cycle stale while ignore skips it as well`() {
        // Arrange
        val analysis = DependencyAnalysis(listOf(cyclic(foo, bar), cyclic(bar, foo)))
        val rule = cycleRule.copy(ignore = listOf("b/"), accept = listOf(accepted("a/Foo.kt", "b/Bar.kt")))

        // Act
        val violations = DependencyRuleEvaluator(DependencyRules(cyclesBetweenFiles = rule)).evaluate(analysis)

        // Assert
        assertThat(violations).isEmpty()
    }

    private fun accepted(vararg files: String) = AcceptedDependency(files.toList(), "Known and fine.")

    private fun cyclic(from: Declaration, to: Declaration) = DeclarationDependency(from, to, isCyclic = true)

    private fun plain(from: Declaration, to: Declaration) = DeclarationDependency(from, to)

    companion object {
        private const val STALE_INSTRUCTION =
            "The analysis no longer finds these accepted dependencies: remove their entries from the config."
    }
}
