package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.renderers

import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.ThresholdConfiguration
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.ThresholdViolation
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters.AnsiColorFormatter

class SummaryRenderer {
    companion object {
        private const val SEPARATOR_WIDTH = 60
        private const val CHECK_MARK = "✓"
        private const val CROSS_MARK = "✗"
        private const val SEPARATOR_LINE = "═"
        private const val HEADER_TITLE = "Metric Threshold Check Results"
        private const val SUCCESS_MESSAGE = "All checks passed!"
    }

    fun render(violations: List<ThresholdViolation>, config: ThresholdConfiguration): String {
        val lines = mutableListOf<String>()

        lines.add("")
        lines.add(AnsiColorFormatter.bold(HEADER_TITLE))
        lines.add(SEPARATOR_LINE.repeat(SEPARATOR_WIDTH))

        if (violations.isEmpty()) {
            lines.add(AnsiColorFormatter.green("$CHECK_MARK $SUCCESS_MESSAGE"))
            lines.add("")
            val totalMetrics = config.fileMetrics.size
            lines.add("Checked $totalMetrics threshold(s)")
        } else {
            lines.add(AnsiColorFormatter.red("$CROSS_MARK ${violations.size} violation(s) found!"))
        }

        lines.add(SEPARATOR_LINE.repeat(SEPARATOR_WIDTH))

        return lines.joinToString("\n")
    }
}
