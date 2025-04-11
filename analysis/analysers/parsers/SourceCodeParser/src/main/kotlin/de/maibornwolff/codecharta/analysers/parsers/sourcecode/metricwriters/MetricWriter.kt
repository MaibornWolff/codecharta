package de.maibornwolff.codecharta.analysers.parsers.sourcecode.metricwriters

import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.analysers.parsers.sourcecode.metrics.ProjectMetrics

interface MetricWriter {
    fun generate(projectMetrics: ProjectMetrics, allMetrics: Set<String>, pipedProject: Project? = null)
}
