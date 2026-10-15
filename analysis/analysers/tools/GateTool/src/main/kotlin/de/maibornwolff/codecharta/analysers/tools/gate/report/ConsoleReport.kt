package de.maibornwolff.codecharta.analysers.tools.gate.report

import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity
import de.maibornwolff.codecharta.analysers.tools.gate.config.toDisplayText
import de.maibornwolff.codecharta.analysers.tools.gate.rules.CycleViolation
import de.maibornwolff.codecharta.analysers.tools.gate.rules.DependenciesNotChecked
import de.maibornwolff.codecharta.analysers.tools.gate.rules.GateResult
import de.maibornwolff.codecharta.analysers.tools.gate.rules.MetricViolation
import de.maibornwolff.codecharta.analysers.tools.gate.rules.UnknownMetric
import de.maibornwolff.codecharta.analysers.tools.gate.rules.UpwardViolation
import de.maibornwolff.codecharta.analysers.tools.gate.rules.Violation
import java.io.PrintStream

class ConsoleReport(private val output: PrintStream, private val metricOrder: List<String>) {
    fun print(result: GateResult) {
        if (result.violations.isEmpty()) {
            output.println("No rule broken, ${counted(result.filesChecked, "file")} checked")
            return
        }
        groupsInConfigOrder(result.violations).forEach { group ->
            printGroup(group)
            output.println()
        }
        output.println(summary(result))
    }

    private fun groupsInConfigOrder(violations: List<Violation>): List<List<Violation>> = violations
        .groupBy(::groupKey)
        .values
        .sortedWith(
            compareBy<List<Violation>> { sectionOf(it.first()) }
                .thenBy { it.first() is UnknownMetric }
                .thenByDescending { it.first().severity }
                .thenByDescending { (it.first() as? MetricViolation)?.threshold }
        )

    private fun groupKey(violation: Violation): List<Any?> = when (violation) {
        is MetricViolation -> listOf(violation.severity, violation.metric, violation.threshold, violation.instruction)
        is UnknownMetric -> listOf(UnknownMetric::class, violation.metric)
        is CycleViolation -> listOf(CycleViolation::class, violation.isInsideOneFile, violation.severity, violation.instruction)
        is UpwardViolation -> listOf(UpwardViolation::class, violation.severity, violation.instruction)
        is DependenciesNotChecked -> listOf(DependenciesNotChecked::class)
    }

    private fun sectionOf(violation: Violation): Int {
        val afterMetrics = metricOrder.size
        return when (violation) {
            is MetricViolation -> metricOrder.indexOf(violation.metric).takeIf { it >= 0 } ?: afterMetrics
            is UnknownMetric -> metricOrder.indexOf(violation.metric).takeIf { it >= 0 } ?: afterMetrics
            is CycleViolation -> if (violation.isInsideOneFile) afterMetrics + 2 else afterMetrics + 1
            is UpwardViolation -> afterMetrics + 3
            is DependenciesNotChecked -> afterMetrics + 4
        }
    }

    private fun printGroup(group: List<Violation>) {
        val first = group.first()
        output.println(SEVERITY_LABELS.getValue(first.severity).padEnd(LABEL_WIDTH) + title(group))
        first.instruction?.let { InstructionBox.lines(it).forEach(output::println) }
        bodyLines(group).forEach(output::println)
    }

    private fun title(group: List<Violation>): String = when (val first = group.first()) {
        is MetricViolation -> "${first.metric} > ${first.threshold.toDisplayText()}"
        is UnknownMetric -> "unknown metric: ${first.metric}"
        is CycleViolation ->
            if (first.isInsideOneFile) {
                counted(group.size, "cycle inside a file", "cycles inside files")
            } else {
                counted(group.size, "cycle between files", "cycles between files")
            }
        is UpwardViolation -> counted(group.size, "upward dependency", "upward dependencies")
        is DependenciesNotChecked -> "cycles not checked"
    }

    private fun bodyLines(group: List<Violation>): List<String> = when (group.first()) {
        is MetricViolation -> metricLines(group.filterIsInstance<MetricViolation>())
        is CycleViolation -> CycleText.lines(group.filterIsInstance<CycleViolation>())
        is UpwardViolation -> UpwardText.lines(group.filterIsInstance<UpwardViolation>())
        is UnknownMetric, is DependenciesNotChecked -> emptyList()
    }

    private fun metricLines(violations: List<MetricViolation>): List<String> {
        val pathWidth = violations.maxOf { it.path.length }
        return violations.sortedByDescending { it.value }.map { INDENT + it.path.padEnd(pathWidth) + INDENT + it.value.toDisplayText() }
    }

    private fun summary(result: GateResult): String {
        val errors = counted(result.count(Severity.ERROR), "error")
        val warnings = counted(result.count(Severity.WARNING), "warning")
        return "$errors, $warnings, ${counted(result.filesChecked, "file")} checked"
    }

    companion object {
        private const val LABEL_WIDTH = 7
        private const val INDENT = "  "
        private val SEVERITY_LABELS = mapOf(Severity.ERROR to "ERROR", Severity.WARNING to "WARN")
    }
}
