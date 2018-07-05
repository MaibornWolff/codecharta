package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.baseFolder
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.IOException


class SourceCodeParserMain_TabularFileTest {

   private val outputStream = retrieveOutputAndErrorStream {
       SourceCodeParserMain.main(arrayOf("src/test/resources/$baseFolder/miniJavaProject/mini/RealLinesShort.java", "-out=table"))
   }.first

    @Test
    @Throws(IOException::class)
    fun tabular_output_for_single_file_contains_correct_header() {
        assertThat(outputStream.lines()[0]).contains("LoC", "Code")
        assertThat(outputStream.lines()[1]).contains("------")
    }

    @Test
    @Throws(IOException::class)
    fun tabular_output_for_single_file_has_correct_length() {
        assertThat(outputStream.lines().size).isEqualTo(2 + 7 + 1)//header+code+trailing newline
    }


}