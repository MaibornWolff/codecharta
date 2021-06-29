package de.maibornwolff.codecharta.importer.understand

import de.maibornwolff.codecharta.importer.understand.UnderstandImporter.Companion.main
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.io.File

class UnderstandImporterTest {

    @Test
    fun `should create json uncompressed file`() {
        main(arrayOf("src/test/resources/understand.csv", "-nc", "-o=src/test/resources/understand.cc.json"))
        val file = File("src/test/resources/understand.cc.json")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should create json gzip file`() {
        main(arrayOf("src/test/resources/understand.csv", "-o=src/test/resources/understand.cc.json"))
        val file = File("src/test/resources/understand.cc.json.gz")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should contain Lines value of 44`() {
        main(arrayOf("src/test/resources/understand.csv", "-nc", "-o=src/test/resources/understand.cc.json"))
        val file = File("src/test/resources/understand.cc.json")
        file.deleteOnExit()

        assertThat(file.readText()).contains(listOf("\"max_lcom\":50"))
    }
}
