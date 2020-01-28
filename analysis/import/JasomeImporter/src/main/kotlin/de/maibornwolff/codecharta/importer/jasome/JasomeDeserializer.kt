package de.maibornwolff.codecharta.importer.jasome

import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.dataformat.xml.JacksonXmlModule
import com.fasterxml.jackson.dataformat.xml.XmlMapper
import de.maibornwolff.codecharta.importer.jasome.model.Project
import java.io.IOException
import java.io.InputStream

class JasomeDeserializer {
    @Throws(IOException::class)
    fun deserializeJasomeXML(inStream: InputStream): Project {
        val mapper = XmlMapper(JacksonXmlModule())
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
        mapper.setDefaultUseWrapper(false)
        return mapper.readValue<Project>(inStream, Project::class.java)
    }
}
