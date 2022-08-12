package de.maibornwolff.codecharta.importer.crococosmo

import de.maibornwolff.codecharta.importer.crococosmo.CrococosmoImporter.Companion.main
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.io.File

class CrococosmoImporterTest {

    @Test
    fun `should create json uncompressed file`() {
        main(
            arrayOf(
                "src/test/resources/test.xml",
                "-nc",
                "-o=src/test/resources/test"
            )
        )
        val file1 = File("src/test/resources/test_1.cc.json")
        val file2 = File("src/test/resources/test_2.cc.json")

        file1.deleteOnExit()
        file2.deleteOnExit()

        assertTrue(file1.exists())
        assertTrue(file2.exists())
    }

    @Test
    fun `should create json compressed file`() {
        main(
            arrayOf(
                "src/test/resources/test.xml",
                "-o=src/test/resources/test"
            )
        )
        val file1 = File("src/test/resources/test_1.cc.json.gz")
        val file2 = File("src/test/resources/test_2.cc.json.gz")

        file1.deleteOnExit()
        file2.deleteOnExit()

        assertTrue(file1.exists())
        assertTrue(file2.exists())
    }
}
