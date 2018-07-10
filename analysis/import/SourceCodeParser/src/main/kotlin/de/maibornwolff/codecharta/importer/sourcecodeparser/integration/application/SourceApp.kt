package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.application.OopApp
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricTable

class SourceApp(private val locationResolver: LocationResolver, private val printer: Printer) {

    private val oopUseCase = OopApp()

    fun printMetrics(locations: List<String>){
        val metrics: List<MetricTable> = locationResolver
                .resolve(locations)
                .filter { it.language() == "java" }
                .map { oopUseCase.fileSummary(it) }

        if(metrics.size == 1){
            printer.printFile(metrics[0])
        }else{
            printer.printFolder(metrics)
        }
    }

}