package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application

class SourceCodeParserEntryPoint(private val printer: Printer) {

    fun printDetailedMetrics(detailedSourceProvider: DetailedSourceProvider){
        printer.printDetails(calculateDetailedMetrics(detailedSourceProvider))
    }

    fun printOverviewMetrics(overviewSourceProvider: OverviewSourceProvider) {
        printer.printOverview(calculateOverviewMetrics(overviewSourceProvider))
    }

}