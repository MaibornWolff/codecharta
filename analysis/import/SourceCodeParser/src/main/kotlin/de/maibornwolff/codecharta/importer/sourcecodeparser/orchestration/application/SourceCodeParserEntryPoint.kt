package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application

class SourceCodeParserEntryPoint(private val metricCalculator: MetricCalculator, private val metricWriter: MetricWriter) {

    fun printDetailedMetrics(detailedSourceProvider: DetailedSourceProvider) {
        metricWriter.printDetails(metricCalculator.calculateDetailedMetrics(detailedSourceProvider))
    }

    fun printOverviewMetrics(overviewSourceProvider: OverviewSourceProvider) {
        metricWriter.printOverview(metricCalculator.calculateOverviewMetrics(overviewSourceProvider))
    }

}