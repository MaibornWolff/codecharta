package de.maibornwolff.codecharta.importer.jasome.model

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper

class Package(
        @JsonProperty("name") var name: String?,
        @JacksonXmlElementWrapper(localName = "Metrics") @JsonProperty("Metric") var metrics: List<Metric>? = listOf(),
        @JacksonXmlElementWrapper(localName = "Classes") @JsonProperty("Class")
        var classes: List<de.maibornwolff.codecharta.importer.jasome.model.Class>?
)
