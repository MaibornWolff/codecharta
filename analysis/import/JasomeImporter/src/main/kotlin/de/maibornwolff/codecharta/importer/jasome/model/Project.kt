package de.maibornwolff.codecharta.importer.jasome.model

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper

class Project(
        @JacksonXmlElementWrapper(localName = "Packages") @JsonProperty("Package") var packages: List<Package>?
)
