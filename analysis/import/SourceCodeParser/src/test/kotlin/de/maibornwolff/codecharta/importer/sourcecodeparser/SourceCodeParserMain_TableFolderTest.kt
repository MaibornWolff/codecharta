package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.baseFolder
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.IOException


class SourceCodeParserMain_TableFolderTest {

    private val resource = "src/test/resources/$baseFolder/miniJavaProject"

    private val outputStream = retrieveStreamAsString {
        SourceCodeParserMain.mainWithOutputStream(it, arrayOf(resource, "-out=table"))
    }

    @Test
    @Throws(IOException::class)
    fun tabular_output_for_folder_contains_correct_header() {
        assertThat(elementsOf(outputStream.lines()[0])).containsExactly("Language", "Files", "LoC", "RLoC")
        assertThat(outputStream.lines()[1]).contains("------")
    }

    @Test
    @Throws(IOException::class)
    fun `tabular output has header, one line for the java files, and summary`() {
        assertThat(outputStream.lines().size).isEqualTo(2 + 1 + 2)//header+javacode+summary
    }

    @Test
    @Throws(IOException::class)
    fun tabular_output_for_folder_finds_two_java_files() {
        assertThat(elementsOf(outputStream.lines()[2])).contains("Java", "2")
    }

    @Test
    @Throws(IOException::class)
    fun tabular_output_summary_for_folder_sums_loc() {
        assertThat(elementsOf(outputStream.lines()[4])).contains("SUM:", "15")
    }

    @Test
    @Throws(IOException::class)
    fun tabular_output_summary_for_folder_sums_rloc() {
        assertThat(elementsOf(outputStream.lines()[4])).contains("SUM:", "8")
    }


}