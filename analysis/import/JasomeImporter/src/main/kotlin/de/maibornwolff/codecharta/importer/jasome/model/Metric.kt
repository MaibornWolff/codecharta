package de.maibornwolff.codecharta.importer.jasome.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty

@JsonIgnoreProperties("description")
class Metric(
    @JsonProperty("name") var name: String?,
    @JsonProperty("value") var value: String?
)
