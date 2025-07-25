package de.maibornwolff.codecharta.analysers.parsers.sourcecode.e2e

import de.maibornwolff.codecharta.analysers.parsers.sourcecode.SourceCodeParser
import de.maibornwolff.codecharta.analysers.parsers.sourcecode.e2e.StreamHelper.Companion.retrieveStreamAsString
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test

class ParseFolderToTable {
    private val resource = "src/test/resources/sampleproject"

    private val output =
        retrieveStreamAsString {
            SourceCodeParser.mainWithOutputStream(it, arrayOf(resource, "--format=csv", "--default-excludes"))
        }

    @Test
    fun tabular_output_for_folder_contains_correct_header() {
        assertThat(output.lines()[0]).contains("file", "complexity", "functions", "rloc")
    }

    @Test
    fun `tabular output has header, one line for each file`() {
        assertThat(output.lines().size).describedAs(output).isEqualTo(1 + 4 + 1) // header + java files + eof
    }

    @Disabled
    @Test
    fun `files with correct paths and metrics are found`() {
        assertThat(output).contains("bar/foo.java", "bar/hello.java", "foo.java", "29", "39", "11")
    }
}
