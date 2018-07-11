package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTableSum
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.model.*
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import java.io.OutputStreamWriter

class JsonBuilder(projectName: String) {

    private val projectBuilder = ProjectBuilder(projectName)

    fun build(): Project {
        return projectBuilder.build()
    }

    fun addComponentAsNode(metricTableSum: DetailedMetricTableSum): JsonBuilder {
        val node = MutableNode(metricTableSum.name, attributes = hashMapOf(
                "lines_of_code" to metricTableSum[MetricType.LoC],
                "rloc" to metricTableSum[MetricType.RLoc])
        )
        val path = PathFactory.fromFileSystemPath(metricTableSum.path)

        projectBuilder.insertByPath(path, node)
        return this
    }
}