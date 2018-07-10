package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`

import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.Printer
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.MetricTable

class PrinterSpy: Printer{
    var printedRowMetrics: MetricTable? = null

    override fun printFolder(metrics: List<MetricTable>) {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun printFile(rowMetrics: MetricTable) {
        printedRowMetrics = rowMetrics
    }

}