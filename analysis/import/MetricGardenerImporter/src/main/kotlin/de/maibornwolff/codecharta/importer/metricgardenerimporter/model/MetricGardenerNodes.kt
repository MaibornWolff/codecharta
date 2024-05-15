package de.maibornwolff.codecharta.importer.metricgardenerimporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty

@JsonIgnoreProperties(ignoreUnknown = true)
class MetricGardenerNodes(
    @JsonProperty("nodes") var metricGardenerNodes: MutableList<MetricGardenerNode>
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as MetricGardenerNodes

        if (metricGardenerNodes != other.metricGardenerNodes) return false

        return true
    }

    override fun hashCode(): Int {
        return metricGardenerNodes.hashCode()
    }
}
