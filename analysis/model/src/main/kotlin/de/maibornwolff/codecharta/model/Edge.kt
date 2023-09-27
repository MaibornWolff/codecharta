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
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Edge

        return fromNodeName == other.fromNodeName &&
                toNodeName == other.toNodeName &&
                attributes == other.attributes
    }

    fun translateMetrics(metricNameTranslator: MetricNameTranslator) {
        attributes = attributes.mapKeys { metricNameTranslator.translate(it.key) }
    }

    override fun hashCode(): Int {
        var result = fromNodeName.hashCode()
        result = 31 * result + toNodeName.hashCode()
        result = 31 * result + attributes.hashCode()
        return result
    }
}
