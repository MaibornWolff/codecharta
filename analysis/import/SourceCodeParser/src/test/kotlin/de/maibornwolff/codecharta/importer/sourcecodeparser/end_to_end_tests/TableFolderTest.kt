package de.maibornwolff.codecharta.importer.sourcecodeparser.end_to_end_tests

import de.maibornwolff.codecharta.importer.sourcecodeparser.SourceCodeParserMain
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.elementsOf
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.end2EndFolder
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.retrieveStreamAsString
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test


class TableFolderTest {

    private val resource = "src/test/resources/$end2EndFolder/miniJavaProject"

    private val output = retrieveStreamAsString {
        SourceCodeParserMain.mainWithOutputStream(it, arrayOf(resource, "--format=table"))
    }

    @Test
    fun tabular_output_for_folder_contains_correct_header() {
        assertThat(elementsOf(output.lines()[0])).containsExactly("Language", "Files", "LoC", "RLoC")
        assertThat(output.lines()[1]).contains("------")
    }

    @Test
    fun `tabular output has header, one line for the java files, and summary`() {
        assertThat(output.lines().size).describedAs(output).isEqualTo(2 + 1 + 2)//header+javacode+summary
    }

    @Test
    fun tabular_output_for_folder_finds_two_java_files() {
        assertThat(elementsOf(output.lines()[2])).describedAs(output).contains("Java", "2")
    }

    @Test
    fun tabular_output_summary_for_folder_sums_loc() {
        assertThat(elementsOf(output.lines()[4])).describedAs(output).contains("SUM:", "15")
    }

    @Test
    fun tabular_output_summary_for_folder_sums_rloc() {
        assertThat(elementsOf(output.lines()[4])).describedAs(output).contains("SUM:", "10")
    }


}