package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.infrastructureBaseFolder
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.IOException


class SourceCodeParserMainTest {


    @Test
    @Throws(IOException::class)
    fun prints_working_directory_if_file_not_found() {
        val resource = "$infrastructureBaseFolder/java/Foo.java"

        val (outputStream, _) = retrieveOutputAndErrorStream {
            SourceCodeParserMain.main(arrayOf(resource))
        }

        assertThat(outputStream.lines()[0]).contains("working directory")
        assertThat(outputStream.lines()[1]).contains("Could not find file")
    }

    @Test
    @Throws(IOException::class)
    fun prints_tabular_output_when_that_output_type_is_selected() {
        val resource = "src/test/resources/$infrastructureBaseFolder/java/RealLinesShort.java"

        val (outputStream, _) = retrieveOutputAndErrorStream {
            SourceCodeParserMain.main(arrayOf(resource, "-out=table"))
        }

        assertThat(outputStream.lines()[0]).contains("LoC", "Code")
        assertThat(outputStream.lines()[1]).contains("------")
        assertThat(outputStream.lines().size).isEqualTo(2 + 7 + 1)//header+code+trailing
    }

}