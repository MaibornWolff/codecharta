package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MultiMetric
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.SingleMetricTable
import java.io.PrintStream

class JsonStreamPrinter(private val outputStream: PrintStream, private val projectName: String): Printer {
    override fun printFolder(multiMetric: MultiMetric) {
        val jsonBuilder = JsonBuilder(projectName)
        multiMetric.tableSums.forEach { jsonBuilder.addComponentAsNode(it) }

        outputStream.println(jsonBuilder.build())
    }

    override fun printFile(singleTableMetric: SingleMetricTable) {
        val json = JsonBuilder(projectName)
                .addComponentAsNode(singleTableMetric.sum)
                .build()
        outputStream.println(json)
    }
}