package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.baseFolder
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.IOException


class SourceCodeParserMain_TabularSmallFolderTest {

    private val outputStream = retrieveOutputAndErrorStream {
        SourceCodeParserMain.main(arrayOf("src/test/resources/$baseFolder/miniJavaProject", "-out=table"))
    }.first


    @Test
    @Throws(IOException::class)
    fun tabular_output_for_folder_contains_correct_header() {
        assertThat(elementsOf(outputStream.lines()[0])).containsExactly("Language", "Files", "LoC", "RLoC")
        assertThat(outputStream.lines()[1]).contains("------")
    }

    @Test
    @Throws(IOException::class)
    fun tabular_output_for_folder_has_correct_length() {
        assertThat(outputStream.lines().size).isEqualTo(2 + 1 + 2 + 1)//header+javacode+summary+trailing newline
    }

    @Test
    @Throws(IOException::class)
    fun tabular_output_for_folder_finds_one_java_file_with_loc() {
        assertThat(elementsOf(outputStream.lines()[2])).contains("Java", "1")
    }

    @Test
    @Throws(IOException::class)
    fun tabular_output_for_folder_finds_one_java_file_with_rloc() {
        assertThat(elementsOf(outputStream.lines()[2])).contains("Java", "5")
    }

    @Test
    @Throws(IOException::class)
    fun tabular_output_summary_for_folder_finds_one_file_with_loc() {
        assertThat(elementsOf(outputStream.lines()[4])).contains("SUM:", "7")
    }

    @Test
    @Throws(IOException::class)
    fun tabular_output_summary_for_folder_finds_one_file_with_rloc() {
        println(outputStream)
        assertThat(elementsOf(outputStream.lines()[4])).contains("SUM:", "5")
    }


}