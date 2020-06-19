package de.maibornwolff.codecharta.model

import de.maibornwolff.codecharta.translator.MetricNameTranslator

class Edge constructor(
    var fromNodeName: String,
    var toNodeName: String,
    var attributes: Map<String, Any> = mapOf()
) {

    override fun toString(): String {
        return "Edge(fromNodeName=$fromNodeName,toNodeName=$toNodeName, attributes=$attributes)"
    }

    override fun equals(other: Any?): Boolean {
        val otherEdge = other as Edge
        return (
                this.fromNodeName == otherEdge.fromNodeName &&
                        this.toNodeName == otherEdge.toNodeName &&
                        this.attributes == otherEdge.attributes
                )
    }

    fun translateMetrics(metricNameTranslator: MetricNameTranslator) {
        attributes = attributes.mapKeys { metricNameTranslator.translate(it.key) }
    }
}