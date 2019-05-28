package de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters

import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.ProjectMetrics

interface MetricWriter {
    fun generate(projectMetrics: ProjectMetrics, allMetrics: Set<String>)
}