package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.baseFolder
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.IOException


class SourceCodeParserMain_TabularBiggerFolderTest {

    private val outputStream = retrieveOutputAndErrorStream {
        SourceCodeParserMain.main(arrayOf("src/test/resources/$baseFolder/biggerJavaProject", "-out=table"))
    }.first


    @Test
    @Throws(IOException::class)
    fun tabular_output_for_bigger_folder_contains_java_file_count() {
        assertThat(elementsOf(outputStream.lines()[2])).contains("Java", "5")
    }

    @Test
    @Throws(IOException::class)
    fun tabular_output_for_bigger_folder_contains_java_lines_of_code() {
        assertThat(elementsOf(outputStream.lines()[2])).contains("Java", "157")
    }

    @Test
    @Throws(IOException::class)
    fun tabular_output_for_bigger_folder_contains_java_real_lines_of_code() {
        assertThat(elementsOf(outputStream.lines()[2])).describedAs("\n$outputStream").contains("Java", "72")
    }

}