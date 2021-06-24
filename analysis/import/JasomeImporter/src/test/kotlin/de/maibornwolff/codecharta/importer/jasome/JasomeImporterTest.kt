package de.maibornwolff.codecharta.importer.jasome

import de.maibornwolff.codecharta.importer.jasome.JasomeImporter.Companion.main
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.io.File

internal class JasomeImporterTest {

    @Test
    fun `should create json uncompressed file`() {
        val cliResult = main(arrayOf("src/test/resources/jasome.xml", "-nc", "-o=src/test/resources/jasome.cc.json"))
        val file = File("src/test/resources/jasome.cc.json")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should create json gzip file`() {
        val cliResult = main(arrayOf("src/test/resources/jasome.xml", "-o=src/test/resources/jasome.cc.json"))
        val file = File("src/test/resources/jasome.cc.json.gz")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should contain RTLOC of 149`() {
        val cliResult = main(arrayOf("src/test/resources/jasome.xml", "-nc", "-o=src/test/resources/jasome.cc.json"))
        val file = File("src/test/resources/jasome.cc.json")
        file.deleteOnExit()

        assertThat(file.readText()).contains(listOf("\"RTLOC\":149"))
    }
}
