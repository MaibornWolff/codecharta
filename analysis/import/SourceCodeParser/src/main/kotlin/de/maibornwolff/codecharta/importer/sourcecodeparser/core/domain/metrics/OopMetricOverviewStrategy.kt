package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics

class OopMetricOverviewStrategy: OverviewMetricCalculationStrategy {
    override fun toOverviewMetrics(detailedMetricMap: DetailedMetricMap?): OverviewMetricMap {
        return OverviewMetricMap(detailedMetricMap?.map(::mapEntry).orEmpty())
    }

    private fun mapEntry(entry: Map.Entry<DetailedMetricType, Int>): Pair<OverviewMetricType, Int>{
        return when(entry.key){
            DetailedMetricType.LoC -> OverviewMetricType.LoC to entry.value
            DetailedMetricType.RLoc -> OverviewMetricType.RLoc to entry.value
            DetailedMetricType.MCC -> OverviewMetricType.MCC to entry.value
        }
    }
}