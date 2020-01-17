package de.maibornwolff.codecharta.importer.crococosmo

import org.junit.jupiter.api.Test

class CrococosmoDeserializerTest {
    private val deserializer = CrococosmoDeserializer()

    @Test
    fun shouldReadCrococosmoXmlWithMultipleVersionsWithoutException() {
        val `in` = this.javaClass.classLoader.getResourceAsStream("test.xml")
        deserializer.deserializeCrococosmoXML(`in`)
    }
}
