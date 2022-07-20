package de.maibornwolff.codecharta.importer.metricgardener.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import de.maibornwolff.codecharta.model.Path

@JsonIgnoreProperties("types")
class MetricGardenerNode(
    @JsonProperty("name") var name: String?,
    @JsonProperty("type") var type: String?,
    @JsonProperty("metrics") var metrics: Map<String, Any>
                        ) {

    fun getPathWithoutFileName(): Path {
        if (checkNotNull(name).isNotEmpty()) {
            return Path(name!!.split("\\").dropLast(1))
        }
        return Path(emptyList())
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as MetricGardenerNode

        if (name != other.name) return false
        if (type != other.type) return false
        if (metrics != other.metrics) return false

        return true
    }

    override fun hashCode(): Int {
        var result = name?.hashCode() ?: 0
        result = 31 * result + (type?.hashCode() ?: 0)
        result = 31 * result + metrics.hashCode()
        return result
    }
}
