package de.maibornwolff.codecharta.analysers.parsers.unified.metriccalculators

interface MetricPerFileCalc : MetricCalc {
    fun calculateMetricForNode(nodeContext: CalculationContext): Int
}
