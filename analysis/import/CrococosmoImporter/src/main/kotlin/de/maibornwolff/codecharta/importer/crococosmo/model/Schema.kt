package de.maibornwolff.codecharta.importer.crococosmo.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty

@JsonIgnoreProperties("nodeschema", "edgeSchema", "edgeschema")
class Schema(@JsonProperty("versions") val versions: Versions) {

    constructor(versions: List<SchemaVersion>) : this(Versions(versions))
}

class Versions(@JsonProperty("version") val versions: List<SchemaVersion>)

@JsonIgnoreProperties("date")
class SchemaVersion(
    @JsonProperty("id") val id: String,
    @JsonProperty("name") val name: String = "",
    @JsonProperty("revision") val revision: String = ""
)
