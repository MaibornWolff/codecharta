package de.maibornwolff.codecharta.importer.crococosmo.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty

@JsonIgnoreProperties("id")
class Node(@JsonProperty("name") val name: String?,
           @JsonProperty("type") private val type: String?,
           @JsonProperty("node") val children: List<Node>?,
           @JsonProperty(value = "version") val versions: List<Version>?
)
