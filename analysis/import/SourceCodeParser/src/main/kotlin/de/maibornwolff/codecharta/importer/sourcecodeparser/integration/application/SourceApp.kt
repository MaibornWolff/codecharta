package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.FolderSummary
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.application.OopApp
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage

class SourceApp(private val locationResolver: LocationResolver, private val printer: Printer) {

    private val oopUseCase = OopApp()

    fun printMetrics(locations: List<String>){
        val metrics: List<MetricTable> = locationResolver
                .resolve(locations)
                .filter { it.language() == OopLanguage.JAVA }
                .map { oopUseCase.fileSummary(it) }

        if(metrics.size == 1){
            printer.printFile(metrics[0])
        }else{
            val folderSummary = FolderSummary(metrics.map { it.summary() })
            printer.printFolder(folderSummary)
        }
    }

}