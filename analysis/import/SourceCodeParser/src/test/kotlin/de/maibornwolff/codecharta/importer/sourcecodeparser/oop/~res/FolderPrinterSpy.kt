package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MultiMetric
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.SingleMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.Printer

class FolderPrinterSpy: Printer {
    var printedFolderMetrics: MultiMetric? = null

    override fun printFile(rowMetrics: SingleMetricTable) {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun printFolder(folderMetrics: MultiMetric) {
        printedFolderMetrics = folderMetrics
    }
}