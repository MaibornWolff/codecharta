package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetric
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTable
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import java.io.OutputStreamWriter
import java.io.PrintStream

class JsonStreamPrinter(private val outputStream: PrintStream, private val projectName: String): Printer {
    override fun printFolder(overviewMetric: OverviewMetric) {
        val jsonBuilder = JsonBuilder(projectName)
        overviewMetric.tableSums.forEach { jsonBuilder.addComponentAsNode(it) }

        ProjectSerializer.serializeProject(jsonBuilder.build(), OutputStreamWriter(outputStream))
    }

    override fun printFile(detailedTableMetric: DetailedMetricTable) {
        val jsonBuilder = JsonBuilder(projectName)
                .addComponentAsNode(detailedTableMetric.sum)

        ProjectSerializer.serializeProject(jsonBuilder.build(), OutputStreamWriter(outputStream))
    }
}