package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application

class SourceCodeParserEntryPoint(private val metricWriter: MetricWriter) {

    fun printDetailedMetrics(detailedSourceProvider: DetailedSourceProvider){
        metricWriter.printDetails(calculateDetailedMetrics(detailedSourceProvider))
    }

    fun printOverviewMetrics(overviewSourceProvider: OverviewSourceProvider) {
        metricWriter.printOverview(calculateOverviewMetrics(overviewSourceProvider))
    }

}