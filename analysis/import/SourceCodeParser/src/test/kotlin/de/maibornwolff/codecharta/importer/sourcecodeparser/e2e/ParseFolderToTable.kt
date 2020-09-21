package de.maibornwolff.codecharta.importer.sourcecodeparser.e2e

import de.maibornwolff.codecharta.importer.sourcecodeparser.SourceCodeParserMain
import de.maibornwolff.codecharta.importer.sourcecodeparser.e2e.StreamHelper.Companion.retrieveStreamAsString
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test

class ParseFolderToTable {

    private val resource = "src/test/resources/sampleproject"

    private val output = retrieveStreamAsString {
        SourceCodeParserMain.mainWithOutputStream(it, arrayOf(resource, "--format=table", "--default-excludes"))
    }

    @Test
    fun tabular_output_for_folder_contains_correct_header() {
        assertThat(output.lines()[0]).contains("file", "complexity", "functions", "rloc")
    }

    @Test
    fun `tabular output has header, one line for each file`() {
        assertThat(output.lines().size).describedAs(output).isEqualTo(1 + 3 + 1) // header+javacode+eof
    }

    @Test
    fun `files with correct paths and metrics are found`() {
        assertThat(output).contains("bar/foo.java", "bar/hello.java", "foo.java", "31", "44", "13")
    }
}
