package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.FolderSummary
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.Printer
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricTable

class FilePrinterSpy: Printer{
    var printedFileMetrics: MetricTable? = null

    override fun printFolder(folderMetrics: FolderSummary) {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun printFile(rowMetrics: MetricTable) {
        printedFileMetrics = rowMetrics
    }

}