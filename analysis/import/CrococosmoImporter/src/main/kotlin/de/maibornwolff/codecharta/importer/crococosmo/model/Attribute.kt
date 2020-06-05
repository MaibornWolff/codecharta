package de.maibornwolff.codecharta.importer.crococosmo.model

import com.fasterxml.jackson.annotation.JsonProperty

class Attribute(
        @JsonProperty("name") val name: String,
        @JsonProperty("value") val value: String
)
