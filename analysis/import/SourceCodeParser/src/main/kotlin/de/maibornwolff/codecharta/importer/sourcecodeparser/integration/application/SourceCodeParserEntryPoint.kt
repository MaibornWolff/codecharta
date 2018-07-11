package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application

class SourceCodeParserEntryPoint(private val printer: Printer) {

    fun printMetrics(singleSourceProvider: SingleSourceProvider){
        printer.printFile(calculateSingleMetrics(singleSourceProvider))
    }

    fun printMetrics(multiSourceProvider: MultiSourceProvider) {
        printer.printFolder(calculateMultiMetrics(multiSourceProvider))
    }

}