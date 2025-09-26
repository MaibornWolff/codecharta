package de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators

interface MetricPerFileCalc : MetricCalc {
    fun calculateMetricForNode(params: CalculationContext): Int
}
