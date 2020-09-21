package de.maibornwolff.codecharta.importer.sourcecodeparser.e2e

import de.maibornwolff.codecharta.importer.sourcecodeparser.SourceCodeParserMain
import de.maibornwolff.codecharta.importer.sourcecodeparser.e2e.StreamHelper.Companion.retrieveStreamAsString
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test

class ParseFileToTable {

    private val resource = "src/test/resources/ScriptShellSample.java"

    private val output = retrieveStreamAsString {
        SourceCodeParserMain.mainWithOutputStream(it, arrayOf(resource, "--format=table"))
    }

    @Test
    fun `table output has correct header`() {
        assertThat(output.lines()[0]).contains("file", "complexity", "functions", "rloc")
    }

    @Test
    fun `table output has correct length`() {
        assertThat(output.lines().size).describedAs("\n" + output).isEqualTo(1 + 1 + 1)
    }

    @Test
    fun `table output has correct metrics for line`() {
        assertThat(output.lines()[1]).contains("ScriptShellSample.java", "6", "13", "4")
    }
}
