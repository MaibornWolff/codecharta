package de.maibornwolff.codecharta.importer.crococosmo.model

import com.fasterxml.jackson.annotation.JsonProperty

class Version(
    @JsonProperty("id") val id: String,
    @JsonProperty("attribute") val attribute: List<Attribute>?
)
