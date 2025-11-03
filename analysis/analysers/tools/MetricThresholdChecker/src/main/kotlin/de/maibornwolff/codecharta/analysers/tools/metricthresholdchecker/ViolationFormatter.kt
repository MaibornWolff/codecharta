package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker

import java.io.PrintStream

class ViolationFormatter(
    private val output: PrintStream,
    private val error: PrintStream
) {
    private val red = "\u001B[31m"
    private val green = "\u001B[32m"
    private val yellow = "\u001B[33m"
    private val reset = "\u001B[0m"
    private val bold = "\u001B[1m"

    fun printResults(violations: List<ThresholdViolation>, config: ThresholdConfiguration) {
        printSummary(violations, config)

        if (violations.isNotEmpty()) {
            error.println()
            printViolations(violations)
        }
    }

    private fun printSummary(violations: List<ThresholdViolation>, config: ThresholdConfiguration) {
        val totalMetrics = config.fileMetrics.size

        error.println()
        error.println("${bold}Metric Threshold Check Results$reset")
        error.println("═".repeat(60))

        if (violations.isEmpty()) {
            error.println("$green✓ All checks passed!$reset")
            error.println()
            error.println("Checked $totalMetrics threshold(s)")
        } else {
            error.println("$red✗ ${violations.size} violation(s) found!$reset")
        }
        error.println("═".repeat(60))
    }

    private fun printViolations(violations: List<ThresholdViolation>) {
        error.println("${bold}Violations:$reset")
        error.println()

        val groupedByMetric = violations.groupBy { it.metricName }

        for ((metricName, metricViolations) in groupedByMetric) {
            error.println("${yellow}Metric: $metricName$reset (${metricViolations.size} violations)")
            error.println()

            val sortedViolations = metricViolations.sortedByDescending { violation ->
                calculateExcessAmount(violation)
            }

            printTable(sortedViolations)
            error.println()
        }
    }

    private fun calculateExcessAmount(violation: ThresholdViolation): Double {
        val actualValue = violation.actualValue.toDouble()
        val thresholdValue = violation.threshold.getThresholdValue(violation.violationType)?.toDouble() ?: 0.0

        return when (violation.violationType) {
            ViolationType.BELOW_MIN -> thresholdValue - actualValue
            ViolationType.ABOVE_MAX -> actualValue - thresholdValue
        }
    }

    private fun printTable(violations: List<ThresholdViolation>) {
        val pathColumnWidth = maxOf(20, violations.maxOfOrNull { it.path.length } ?: 20)
        val valueColumnWidth = 15
        val thresholdColumnWidth = 20
        val excessColumnWidth = 15

        val headerFormat = "  %-${pathColumnWidth}s  %-${valueColumnWidth}s  %-${thresholdColumnWidth}s  %-${excessColumnWidth}s"
        val rowFormat = "  $red%-${pathColumnWidth}s$reset  %-${valueColumnWidth}s  %-${thresholdColumnWidth}s  %-${excessColumnWidth}s"

        error.println(String.format(headerFormat, "Path", "Actual Value", "Threshold", "Exceeds By"))
        error.println("  " + "─".repeat(pathColumnWidth + valueColumnWidth + thresholdColumnWidth + excessColumnWidth + 6))

        for (violation in violations) {
            val thresholdStr = formatThreshold(violation.threshold, violation.violationType)
            val excessStr = formatExcess(violation)

            error.println(
                String.format(
                    rowFormat,
                    truncatePath(violation.path, pathColumnWidth),
                    formatNumber(violation.actualValue),
                    thresholdStr,
                    excessStr
                )
            )
        }
    }

    private fun formatThreshold(threshold: MetricThreshold, violationType: ViolationType): String {
        return when (violationType) {
            ViolationType.BELOW_MIN -> "min: ${formatNumber(threshold.min!!)}"
            ViolationType.ABOVE_MAX -> "max: ${formatNumber(threshold.max!!)}"
        }
    }

    private fun formatExcess(violation: ThresholdViolation): String {
        val actualValue = violation.actualValue.toDouble()
        val thresholdValue = violation.threshold.getThresholdValue(violation.violationType)?.toDouble() ?: 0.0

        val excess = when (violation.violationType) {
            ViolationType.BELOW_MIN -> thresholdValue - actualValue
            ViolationType.ABOVE_MAX -> actualValue - thresholdValue
        }

        val sign = when (violation.violationType) {
            ViolationType.BELOW_MIN -> "-"
            ViolationType.ABOVE_MAX -> "+"
        }

        return "$sign${formatNumber(excess)}"
    }

    private fun formatNumber(value: Number): String {
        val doubleValue = value.toDouble()
        return if (doubleValue == doubleValue.toLong().toDouble()) {
            doubleValue.toLong().toString()
        } else {
            String.format("%.2f", doubleValue)
        }
    }

    private fun truncatePath(path: String, maxWidth: Int): String {
        if (path.length <= maxWidth) {
            return path
        }
        val ellipsis = "..."
        val prefixLength = (maxWidth - ellipsis.length) / 2
        val suffixLength = maxWidth - ellipsis.length - prefixLength
        return path.substring(0, prefixLength) + ellipsis + path.substring(path.length - suffixLength)
    }
}
