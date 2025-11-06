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
            violations.maxOfOrNull { it.path.length } ?: MIN_PATH_WIDTH
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
        val format = "$TABLE_INDENT%-${pathColumnWidth}s  %-${VALUE_WIDTH}s  %-${THRESHOLD_WIDTH}s  %-${EXCESS_WIDTH}s"
        return String.format(
            format,
            COLUMN_HEADER_PATH,
            COLUMN_HEADER_VALUE,
            COLUMN_HEADER_THRESHOLD,
            COLUMN_HEADER_EXCESS
        )
    }

    private fun renderSeparator(pathColumnWidth: Int): String {
        val totalWidth = pathColumnWidth + VALUE_WIDTH + THRESHOLD_WIDTH + EXCESS_WIDTH + 6
        return TABLE_INDENT + TABLE_LINE.repeat(totalWidth)
    }

    private fun renderRow(violation: ThresholdViolation, pathColumnWidth: Int): String {
        val truncatedPath = pathFormatter.truncate(violation.path, pathColumnWidth)
        val formattedValue = numberFormatter.format(violation.actualValue)
        val formattedThreshold = formatThreshold(violation)
        val formattedExcess = formatExcess(violation)

        val format = "$TABLE_INDENT%-${pathColumnWidth}s  %-${VALUE_WIDTH}s  %-${THRESHOLD_WIDTH}s  %-${EXCESS_WIDTH}s"
        val row = String.format(
            format,
            truncatedPath,
            formattedValue,
            formattedThreshold,
            formattedExcess
        )

        return AnsiColorFormatter.red(TABLE_INDENT + truncatedPath) +
            row.substring(TABLE_INDENT.length + pathColumnWidth)
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
