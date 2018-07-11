package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application

class SourceCodeParserEntryPoint(private val printer: Printer) {

    fun printSingleMetrics(singleSourceProvider: SingleSourceProvider){
        printer.printFile(calculateSingleMetrics(singleSourceProvider))
    }

    fun printMultiMetrics(multiSourceProvider: MultiSourceProvider) {
        printer.printFolder(calculateMultiMetrics(multiSourceProvider))
    }

}