package de.maibornwolff.codecharta.importer.metricgardenerimporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty

@JsonIgnoreProperties("types")
class Node(
    @JsonProperty("name") var name: String?,
    @JsonProperty("type") var type: String?,
    @JsonProperty("metrics") var metrics: Metrics?
           ) {

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Node

        if (name != other.name) return false
        if (type != other.type) return false
        if (metrics != other.metrics) return false

        return true
    }

    override fun hashCode(): Int {
        var result = name?.hashCode() ?: 0
        result = 31 * result + (type?.hashCode() ?: 0)
        result = 31 * result + (metrics?.hashCode() ?: 0)
        return result
    }
}
