package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.renderers

import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.ThresholdViolation
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters.AnsiColorFormatter
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters.ExcessCalculator
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters.TextWrapper
import de.maibornwolff.codecharta.model.AttributeDescriptor

class ViolationGroupRenderer(
    private val tableRenderer: ViolationTableRenderer,
    private val textWrapper: TextWrapper,
    private val excessCalculator: ExcessCalculator
) {
    companion object {
        private const val CONSOLE_WIDTH = 78
        private const val VIOLATIONS_HEADER = "Violations:"
        private const val METRIC_PREFIX = "Metric:"
        private const val VIOLATIONS_SUFFIX = "violations"
    }

    fun render(violations: List<ThresholdViolation>, attributeDescriptors: Map<String, AttributeDescriptor>): String {
        if (violations.isEmpty()) {
            return ""
        }

        val lines = mutableListOf<String>()
        lines.add(AnsiColorFormatter.bold(VIOLATIONS_HEADER))
        lines.add("")

        val groupedByMetric = violations.groupBy { it.metricName }

        for ((metricName, metricViolations) in groupedByMetric) {
            lines.add(renderMetricHeader(metricName, metricViolations.size))

            val descriptor = attributeDescriptors[metricName]
            if (descriptor != null && descriptor.description.isNotBlank()) {
                val wrappedLines = textWrapper.wrap(descriptor.description, CONSOLE_WIDTH, "")
                lines.addAll(wrappedLines)
            }

            lines.add("")

            val sortedViolations = metricViolations.sortedByDescending { violation ->
                excessCalculator.calculate(violation)
            }

            lines.add(tableRenderer.render(sortedViolations))
            lines.add("")
        }

        return lines.joinToString("\n")
    }

    private fun renderMetricHeader(metricName: String, violationCount: Int): String {
        return AnsiColorFormatter.yellow("$METRIC_PREFIX $metricName") + " ($violationCount $VIOLATIONS_SUFFIX)"
    }
}
