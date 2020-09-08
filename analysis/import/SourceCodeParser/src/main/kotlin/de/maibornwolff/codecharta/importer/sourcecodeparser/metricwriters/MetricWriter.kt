package de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters

import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.ProjectMetrics
import de.maibornwolff.codecharta.model.Project

interface MetricWriter {
    fun generate(projectMetrics: ProjectMetrics, allMetrics: Set<String>, pipedProject: Project? = null)
}
