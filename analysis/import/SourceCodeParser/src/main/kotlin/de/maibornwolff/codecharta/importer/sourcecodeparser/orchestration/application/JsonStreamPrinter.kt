package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.domain.metrics.OverviewMetric
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTable
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import java.io.OutputStreamWriter
import java.io.PrintStream

class JsonStreamPrinter(private val outputStream: PrintStream, private val projectName: String): Printer {

    override fun printOverview(overviewMetric: OverviewMetric) {
        val jsonBuilder = JsonBuilder(projectName)
        overviewMetric.tableSums.forEach { jsonBuilder.addComponentAsNode(it) }

        ProjectSerializer.serializeProject(jsonBuilder.build(), OutputStreamWriter(outputStream))
    }

    override fun printDetails(detailedMetricTable: DetailedMetricTable) {
        val jsonBuilder = JsonBuilder(projectName)
                .addComponentAsNode(detailedMetricTable.sum)

        ProjectSerializer.serializeProject(jsonBuilder.build(), OutputStreamWriter(outputStream))
    }
}