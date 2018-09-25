package de.maibornwolff.codecharta.importer.sourcecodeparser.end_to_end_tests

import de.maibornwolff.codecharta.importer.sourcecodeparser.SourceCodeParserMain
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.elementsOf
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.end2EndFolder
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.retrieveStreamAsString
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test


class TableFileTest {

    private val resource = "src/test/resources/$end2EndFolder/miniJavaProject/mini/RealLinesShort.java"

    private val output = retrieveStreamAsString {
        SourceCodeParserMain.mainWithOutputStream(it, arrayOf(resource, "--format=table"))
    }

    @Test
    fun `table output has correct header`() {
        assertThat(elementsOf(output.lines()[0])).describedAs(output).containsExactly("LoC", "RLoC", "MCC", "Code")
        assertThat(output.lines()[1]).describedAs("\n" + output).contains("------")
    }

    @Test
    fun `table output has correct length`() {
        assertThat(output.lines().size).describedAs("\n" + output).isEqualTo(2 + 7)//header+each code line
    }

    @Test
    fun `table output has correct metrics for line`() {
        assertThat(elementsOf(output.lines()[7])).describedAs("\n" + output).contains("6", "5", "public", "void", "noop(){")
    }


}