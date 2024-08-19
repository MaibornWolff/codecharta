package de.maibornwolff.codecharta.parser.sourcecodeparser.metricwriters

import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.parser.sourcecodeparser.metrics.ProjectMetrics

interface MetricWriter {
    fun generate(projectMetrics: ProjectMetrics, allMetrics: Set<String>, pipedProject: Project? = null)
}
