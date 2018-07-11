package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.FolderSummary
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.Printer

class FolderPrinterSpy: Printer {
    var printedFolderMetrics: FolderSummary? = null

    override fun printFile(rowMetrics: MetricTable) {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun printFolder(folderMetrics: FolderSummary) {
        printedFolderMetrics = folderMetrics
    }
}