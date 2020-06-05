package de.maibornwolff.codecharta.importer.crococosmo.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty

@JsonIgnoreProperties("edges")
class Graph(
    @JsonProperty("schema") val schema: Schema,
    @JsonProperty("nodes") val nodes: List<Node>
)
