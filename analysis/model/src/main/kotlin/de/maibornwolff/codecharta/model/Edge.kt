package de.maibornwolff.codecharta.model

import de.maibornwolff.codecharta.translator.MetricNameTranslator

/**
 * A dependency between two nodes, addressed by their canonical endpoint paths.
 *
 * [isCyclic] and [isPointingUpwards] describe the edge's position in the dependency graph: whether it
 * takes part in a cycle, and whether it runs against the levelized architectural flow. The four edge
 * types DependaCharta names (regular, cyclic, container-level feedback, leaf-level feedback) are a pure
 * function of that pair, so the type itself is derived where it is consumed and never stored here.
 */
class Edge constructor(
    var fromNodeName: String,
    var toNodeName: String,
    var attributes: Map<String, Any> = mapOf(),
    val isCyclic: Boolean = false,
    val isPointingUpwards: Boolean = false
) {
    /**
     * The same edge re-pathed onto new endpoints. Filters that move or rename nodes must go through this
     * rather than the three-argument constructor, which would silently drop the graph flags.
     */
    fun withEndpoints(fromNodeName: String, toNodeName: String): Edge =
        Edge(fromNodeName, toNodeName, attributes, isCyclic, isPointingUpwards)

    override fun toString(): String = "Edge(fromNodeName=$fromNodeName,toNodeName=$toNodeName, attributes=$attributes," +
        " isCyclic=$isCyclic, isPointingUpwards=$isPointingUpwards)"

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Edge

        return fromNodeName == other.fromNodeName &&
            toNodeName == other.toNodeName &&
            attributes == other.attributes &&
            isCyclic == other.isCyclic &&
            isPointingUpwards == other.isPointingUpwards
    }

    fun translateMetrics(metricNameTranslator: MetricNameTranslator) {
        attributes =
            attributes.mapKeys {
                metricNameTranslator.translate(it.key)
            }
    }

    override fun hashCode(): Int {
        var result = fromNodeName.hashCode()
        result = 31 * result + toNodeName.hashCode()
        result = 31 * result + attributes.hashCode()
        result = 31 * result + isCyclic.hashCode()
        result = 31 * result + isPointingUpwards.hashCode()
        return result
    }
}
