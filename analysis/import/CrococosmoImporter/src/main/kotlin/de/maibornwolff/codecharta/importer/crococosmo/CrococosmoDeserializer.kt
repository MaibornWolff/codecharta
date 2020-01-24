package de.maibornwolff.codecharta.importer.crococosmo

import com.fasterxml.jackson.dataformat.xml.JacksonXmlModule
import com.fasterxml.jackson.dataformat.xml.XmlMapper
import de.maibornwolff.codecharta.importer.crococosmo.model.Graph

import java.io.IOException
import java.io.InputStream

class CrococosmoDeserializer {
    @Throws(IOException::class)
    fun deserializeCrococosmoXML(inStream: InputStream): Graph {
        val module = JacksonXmlModule()
        module.setDefaultUseWrapper(false)
        return XmlMapper(module).readValue<Graph>(inStream, Graph::class.java)
    }
}
