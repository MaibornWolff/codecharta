package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MultiMetric
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.Printer
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.SingleMetricTable

class FilePrinterSpy: Printer{
    var printedFileMetrics: SingleMetricTable? = null

    override fun printFolder(folderMetrics: MultiMetric) {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun printFile(rowMetrics: SingleMetricTable) {
        printedFileMetrics = rowMetrics
    }

}