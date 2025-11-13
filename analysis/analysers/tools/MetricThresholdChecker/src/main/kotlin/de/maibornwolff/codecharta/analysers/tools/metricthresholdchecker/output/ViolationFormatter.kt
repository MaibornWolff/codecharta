package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output

import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.ThresholdConfiguration
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.ThresholdViolation
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters.ExcessCalculator
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters.NumberFormatter
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters.PathFormatter
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters.TextWrapper
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.renderers.SummaryRenderer
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.renderers.ViolationGroupRenderer
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.renderers.ViolationTableRenderer
import de.maibornwolff.codecharta.model.AttributeDescriptor
import java.io.PrintStream

class ViolationFormatter(
    private val output: PrintStream,
    private val error: PrintStream
) {
    private val numberFormatter = NumberFormatter()
    private val pathFormatter = PathFormatter()
    private val textWrapper = TextWrapper()
    private val excessCalculator = ExcessCalculator()

    private val summaryRenderer = SummaryRenderer()
    private val tableRenderer = ViolationTableRenderer(numberFormatter, pathFormatter, excessCalculator)
    private val groupRenderer = ViolationGroupRenderer(tableRenderer, textWrapper, excessCalculator)

    fun printResults(
        violations: List<ThresholdViolation>,
        config: ThresholdConfiguration,
        attributeDescriptors: Map<String, AttributeDescriptor>
    ) {
        val summary = summaryRenderer.render(violations, config)
        error.println(summary)

        if (violations.isNotEmpty()) {
            error.println()
            val groupedOutput = groupRenderer.render(violations, attributeDescriptors)
            error.println(groupedOutput)
        }
    }
}
