package de.maibornwolff.treesitter.excavationsite.integration.metrics.calculators

import de.maibornwolff.treesitter.excavationsite.integration.metrics.domain.CalculationContext

fun interface MetricPerFileCalc {
    fun calculateMetricForNode(nodeContext: CalculationContext): Int
}
