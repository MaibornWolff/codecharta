package de.maibornwolff.codecharta.importer.codemaat

import de.maibornwolff.codecharta.importer.codemaat.CodeMaatImporter.Companion.main
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.io.File

class CodeMaatImporterTest {

    @Test
    fun `should create json uncompressed file`() {
        main(
            arrayOf(
                "src/test/resources/coupling-codemaat.csv",
                "-nc",
                "-o=src/test/resources/coupling-codemaat.cc.json"
                   )
            )
        val file = File("src/test/resources/coupling-codemaat.cc.json")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should create json gzip file`() {
        main(
            arrayOf(
                "src/test/resources/coupling-codemaat.csv",
                "-o=src/test/resources/coupling-codemaat.cc.json"
                   )
            )
        val file = File("src/test/resources/coupling-codemaat.cc.json.gz")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should contain avgCommits value of 5`() {
        main(
            arrayOf(
                "src/test/resources/coupling-codemaat.csv",
                "-nc",
                "-o=src/test/resources/coupling-codemaat.cc.json"
                   )
            )
        val file = File("src/test/resources/coupling-codemaat.cc.json")
        file.deleteOnExit()

        assertThat(file.readText()).contains(listOf("\"avgCommits\":5"))
    }
}
