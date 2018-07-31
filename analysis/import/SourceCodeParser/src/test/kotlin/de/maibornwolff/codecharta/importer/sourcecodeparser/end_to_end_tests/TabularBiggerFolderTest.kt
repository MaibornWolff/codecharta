package de.maibornwolff.codecharta.importer.sourcecodeparser.end_to_end_tests

import de.maibornwolff.codecharta.importer.sourcecodeparser.SourceCodeParserMain
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.elementsOf
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.end2EndFolder
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.retrieveStreamAsString
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test


class TabularBiggerFolderTest {

    private val resource = "src/test/resources/$end2EndFolder/biggerJavaProject"

    private val output = retrieveStreamAsString {
        SourceCodeParserMain.mainWithOutputStream(it, arrayOf(resource, "--format=table"))
    }

    @Test
    fun tabular_output_for_bigger_folder_contains_java_file_count() {
        assertThat(elementsOf(output.lines()[2])).describedAs(output).contains("Java", "5")
    }

    @Test
    fun tabular_output_for_bigger_folder_contains_java_lines_of_code() {
        assertThat(elementsOf(output.lines()[2])).describedAs(output).contains("Java", "157")
    }

    @Test
    fun tabular_output_for_bigger_folder_contains_java_real_lines_of_code() {
        assertThat(elementsOf(output.lines()[2])).describedAs("\n$output").contains("Java", "101")
    }

}