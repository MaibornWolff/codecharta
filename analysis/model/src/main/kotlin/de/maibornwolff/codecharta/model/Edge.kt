package de.maibornwolff.codecharta.model

import de.maibornwolff.codecharta.translator.MetricNameTranslator

class Edge constructor(
        val fromNodeName: String,
        val toNodeName: String,
        var attributes: Map<String, Any> = mapOf()
) {

    override fun toString(): String {
        return "Edge(" +
                "fromNodeName=$fromNodeName," +
                "toNodeName=$toNodeName, " +
                "attributes=$attributes)"
    }

    fun translateMetrics(metricNameTranslator: MetricNameTranslator) {
        attributes = attributes.mapKeys { metricNameTranslator.translate(it.key) }
    }
}