package de.maibornwolff.codecharta.analysers.parsers.sourcecode.metricwriters

import de.maibornwolff.codecharta.analysers.parsers.sourcecode.metrics.ProjectMetrics
import de.maibornwolff.codecharta.model.Project

interface MetricWriter {
    fun generate(projectMetrics: ProjectMetrics, allMetrics: Set<String>, pipedProject: Project? = null)
}
