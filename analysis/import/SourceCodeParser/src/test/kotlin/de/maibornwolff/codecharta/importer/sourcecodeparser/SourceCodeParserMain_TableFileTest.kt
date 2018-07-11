package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.baseFolder
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.IOException


class SourceCodeParserMain_TableFileTest {

    private val resource = "src/test/resources/$baseFolder/miniJavaProject/mini/RealLinesShort.java"

    private val output = retrieveStreamAsString {
        SourceCodeParserMain.mainWithOutputStream(it, arrayOf(resource, "-out=table"))
    }

    @Test
    @Throws(IOException::class)
    fun `table output has correct header`() {
        assertThat(elementsOf(output.lines()[0])).contains("LoC", "RLoC", "Code", "Tags")
        assertThat(output.lines()[1]).contains("------")
    }

    @Test
    @Throws(IOException::class)
    fun `table output has correct length`() {
        assertThat(output.lines().size).isEqualTo(2 + 7)//header+each code line
    }

    @Test
    @Throws(IOException::class)
    fun `table output has correct metrics for line`() {
        assertThat(elementsOf(output.lines()[7])).contains("6", "5", "public", "void", "noop(){")
    }


}