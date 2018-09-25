package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTableSum
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetricType
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.PathFactory
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder

class JsonBuilder(projectName: String) {

    private val projectBuilder = ProjectBuilder(projectName)

    fun build(): Project {
        return projectBuilder.build()
    }

    fun addComponentAsNode(metricTableSum: DetailedMetricTableSum): JsonBuilder {
        val node = MutableNode(metricTableSum.sourceDescriptor.name, attributes = hashMapOf(
                "lines_of_code" to metricTableSum[OverviewMetricType.LoC],
                "rloc" to metricTableSum[OverviewMetricType.RLoc],
                "mcc" to metricTableSum[OverviewMetricType.MCC]
        ))
        val path = PathFactory.fromFileSystemPath(metricTableSum.sourceDescriptor.location)

        projectBuilder.insertByPath(path, node)
        return this
    }
}