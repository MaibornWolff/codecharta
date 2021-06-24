import de.maibornwolff.codecharta.importer.csv.CSVImporter.Companion.main
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.assertTrue
import java.io.File


internal class CSVImporterTest{

    @Test
    fun `should create json uncompressed file`() {
        val cliResult = main(arrayOf("src/test/resources/sourcemonitor.csv", "-nc", "-o=src/test/resources/sourcemonitor.cc.json"))
        val file = File("src/test/resources/sourcemonitor.cc.json")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should create json gzip file`() {
        val cliResult = main(arrayOf("src/test/resources/sourcemonitor.csv", "-o=src/test/resources/sourcemonitor.cc.json"))
        val file = File("src/test/resources/sourcemonitor.cc.json.gz")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should contain Lines value of 44`(){
        val cliResult = main(arrayOf("src/test/resources/sourcemonitor.csv", "-nc", "-o=src/test/resources/sourcemonitor.cc.json"))
        val file = File("src/test/resources/sourcemonitor.cc.json")
        file.deleteOnExit()

        assertThat(file.readText()).contains(listOf("\"Lines\":44.0"))
    }

}
