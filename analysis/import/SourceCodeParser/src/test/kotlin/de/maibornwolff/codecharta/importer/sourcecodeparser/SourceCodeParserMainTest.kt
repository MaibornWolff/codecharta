package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.infrastructureBaseFolder
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.IOException


class SourceCodeParserMainTest {


    @Test
    @Throws(IOException::class)
    fun prints_all_rows_plus_header_and_underline() {
        val resource = "$infrastructureBaseFolder/java/Foo.java"

        val (outputStream, _) = retrieveOutputAndErrorStream {
            SourceCodeParserMain.main(arrayOf(resource))
        }

        assertThat(outputStream.lines()[0]).contains("working directory")
        assertThat(outputStream.lines()[1]).contains("Could not find file")
    }
}