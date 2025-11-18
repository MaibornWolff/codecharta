package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.renderers

import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.ThresholdViolation
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.ViolationType
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters.AnsiColorFormatter
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters.ExcessCalculator
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters.NumberFormatter
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters.PathFormatter

class ViolationTableRenderer(
    private val numberFormatter: NumberFormatter,
    private val pathFormatter: PathFormatter,
    private val excessCalculator: ExcessCalculator
) {
    companion object {
        private const val TABLE_INDENT = "  "
        private const val TABLE_LINE = "─"
        private const val COLUMN_HEADER_PATH = "Path"
        private const val COLUMN_HEADER_VALUE = "Actual Value"
        private const val COLUMN_HEADER_THRESHOLD = "Threshold"
        private const val COLUMN_HEADER_EXCESS = "Exceeds By"
        private const val THRESHOLD_MIN_PREFIX = "min:"
        private const val THRESHOLD_MAX_PREFIX = "max:"
        private const val EXCESS_POSITIVE = "+"
        private const val EXCESS_NEGATIVE = "-"

        private const val MIN_PATH_WIDTH = 20
        private const val MAX_PATH_WIDTH = 50
        private const val VALUE_WIDTH = 15
        private const val THRESHOLD_WIDTH = 20
        private const val EXCESS_WIDTH = 15
    }

    fun render(violations: List<ThresholdViolation>): String {
        if (violations.isEmpty()) {
            return ""
        }

        val pathColumnWidth = maxOf(
            MIN_PATH_WIDTH,
            minOf(
                violations.maxOfOrNull { it.path.length } ?: MIN_PATH_WIDTH,
                MAX_PATH_WIDTH
            )
        )

        val lines = mutableListOf<String>()

        lines.add(renderHeader(pathColumnWidth))
        lines.add(renderSeparator(pathColumnWidth))

        violations.forEach { violation ->
            lines.add(renderRow(violation, pathColumnWidth))
        }

        return lines.joinToString("\n")
    }

    private fun renderHeader(pathColumnWidth: Int): String {
        val pathHeader = COLUMN_HEADER_PATH.padStart(pathColumnWidth)
        val valueHeader = COLUMN_HEADER_VALUE.padEnd(VALUE_WIDTH)
        val thresholdHeader = COLUMN_HEADER_THRESHOLD.padEnd(THRESHOLD_WIDTH)
        val excessHeader = COLUMN_HEADER_EXCESS.padEnd(EXCESS_WIDTH)
        return "$TABLE_INDENT$pathHeader  $valueHeader  $thresholdHeader  $excessHeader"
    }

    private fun renderSeparator(pathColumnWidth: Int): String {
        val totalWidth = pathColumnWidth + VALUE_WIDTH + THRESHOLD_WIDTH + EXCESS_WIDTH + 6
        return "$TABLE_INDENT${TABLE_LINE.repeat(totalWidth)}"
    }

    private fun renderRow(violation: ThresholdViolation, pathColumnWidth: Int): String {
        val truncatedPath = pathFormatter.truncate(violation.path, pathColumnWidth)
        val formattedValue = numberFormatter.format(violation.actualValue)
        val formattedThreshold = formatThreshold(violation)
        val formattedExcess = formatExcess(violation)

        val pathPadding = " ".repeat(pathColumnWidth - truncatedPath.length)
        val coloredPath = AnsiColorFormatter.red(truncatedPath)
        val paddedValue = formattedValue.padEnd(VALUE_WIDTH)
        val paddedThreshold = formattedThreshold.padEnd(THRESHOLD_WIDTH)
        val paddedExcess = formattedExcess.padEnd(EXCESS_WIDTH)

        return "$TABLE_INDENT$pathPadding$coloredPath  $paddedValue  $paddedThreshold  $paddedExcess"
    }

    private fun formatThreshold(violation: ThresholdViolation): String {
        return when (violation.violationType) {
            ViolationType.BELOW_MIN -> "$THRESHOLD_MIN_PREFIX ${numberFormatter.format(violation.threshold.min!!)}"
            ViolationType.ABOVE_MAX -> "$THRESHOLD_MAX_PREFIX ${numberFormatter.format(violation.threshold.max!!)}"
        }
    }

    private fun formatExcess(violation: ThresholdViolation): String {
        val excess = excessCalculator.calculate(violation)
        val sign = when (violation.violationType) {
            ViolationType.BELOW_MIN -> EXCESS_NEGATIVE
            ViolationType.ABOVE_MAX -> EXCESS_POSITIVE
        }
        return "$sign${numberFormatter.format(excess)}"
    }
}
