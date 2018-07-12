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
        SourceCodeParserMain.mainWithOutputStream(it, arrayOf(resource, "-out=table"))
    }

    @Test
    fun `table output has correct header`() {
        assertThat(elementsOf(output.lines()[0])).describedAs(output).contains("LoC", "RLoC", "Code", "Tags")
        assertThat(output.lines()[1]).contains("------")
    }

    @Test
    fun `table output has correct length`() {
        assertThat(output.lines().size).describedAs(output).isEqualTo(2 + 7)//header+each code line
    }

    @Test
    fun `table output has correct metrics for line`() {
        assertThat(elementsOf(output.lines()[7])).describedAs(output).contains("6", "5", "public", "void", "noop(){")
    }


}