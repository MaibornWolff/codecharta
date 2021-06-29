package de.maibornwolff.codecharta.importer.csv

import de.maibornwolff.codecharta.importer.csv.SourceMonitorImporter.Companion.main
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import java.io.File

class SourceMonitorImporterTest {

    @Test
    fun `should create json uncompressed file`() {
        main(
            arrayOf(
                "src/test/resources/sourcemonitor.csv",
                "-nc",
                "-o=src/test/resources/sourcemonitor.cc.json"
                   )
            )
        val file = File("src/test/resources/sourcemonitor.cc.json")
        file.deleteOnExit()

        Assertions.assertTrue(file.exists())
    }

    @Test
    fun `should create json gzip file`() {
        main(arrayOf("src/test/resources/sourcemonitor.csv", "-o=src/test/resources/sourcemonitor.cc.json"))
        val file = File("src/test/resources/sourcemonitor.cc.json.gz")
        file.deleteOnExit()

        Assertions.assertTrue(file.exists())
    }
}
