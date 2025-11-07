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
        if (violations.isEmpty()) return ""

        val lines = mutableListOf<String>()
        addViolationsHeader(lines)

        val groupedByMetric = violations.groupBy { it.metricName }
        groupedByMetric.forEach { (metricName, metricViolations) ->
            renderMetricGroup(lines, metricName, metricViolations, attributeDescriptors)
        }

        return lines.joinToString("\n")
    }

    private fun addViolationsHeader(lines: MutableList<String>) {
        lines.add(AnsiColorFormatter.bold(VIOLATIONS_HEADER))
        lines.add("")
    }

    private fun renderMetricGroup(
        lines: MutableList<String>,
        metricName: String,
        metricViolations: List<ThresholdViolation>,
        attributeDescriptors: Map<String, AttributeDescriptor>
    ) {
        lines.add(renderMetricHeader(metricName, metricViolations.size))
        addMetricDescription(lines, metricName, attributeDescriptors)
        lines.add("")

        val sortedViolations = sortViolationsByExcess(metricViolations)
        lines.add(tableRenderer.render(sortedViolations))
        lines.add("")
    }

    private fun addMetricDescription(
        lines: MutableList<String>,
        metricName: String,
        attributeDescriptors: Map<String, AttributeDescriptor>
    ) {
        val descriptor = attributeDescriptors[metricName]
        if (descriptor != null && descriptor.description.isNotBlank()) {
            val wrappedLines = textWrapper.wrap(descriptor.description, CONSOLE_WIDTH, "")
            lines.addAll(wrappedLines)
        }
    }

    private fun sortViolationsByExcess(violations: List<ThresholdViolation>): List<ThresholdViolation> {
        return violations.sortedByDescending { excessCalculator.calculate(it) }
    }

    private fun renderMetricHeader(metricName: String, violationCount: Int): String {
        return AnsiColorFormatter.yellow("$METRIC_PREFIX $metricName") + " ($violationCount $VIOLATIONS_SUFFIX)"
    }
}
