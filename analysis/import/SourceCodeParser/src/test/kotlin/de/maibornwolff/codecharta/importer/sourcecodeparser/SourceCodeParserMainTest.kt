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
        assertThat(outputStream.lines()[1]).contains("Could not find")
    }

    @Test
    @Throws(IOException::class)
    fun tabular_output_for_single_file_contains_correct_header() {
        val resource = "src/test/resources/$infrastructureBaseFolder/java/RealLinesShort.java"

        val (outputStream, _) = retrieveOutputAndErrorStream {
            SourceCodeParserMain.main(arrayOf(resource, "-out=table"))
        }

        assertThat(outputStream.lines()[0]).contains("LoC", "Code")
        assertThat(outputStream.lines()[1]).contains("------")
    }

    @Test
    @Throws(IOException::class)
    fun tabular_output_for_single_file_has_correct_length() {
        val resource = "src/test/resources/$infrastructureBaseFolder/java/RealLinesShort.java"

        val (outputStream, _) = retrieveOutputAndErrorStream {
            SourceCodeParserMain.main(arrayOf(resource, "-out=table"))
        }

        assertThat(outputStream.lines().size).isEqualTo(2 + 7 + 1)//header+code+trailing newline
    }

    @Test
    @Throws(IOException::class)
    fun tabular_output_for_folder_contains_correct_header() {
        val resource = "src/test/resources/$infrastructureBaseFolder/java"

        val (outputStream, _) = retrieveOutputAndErrorStream {
            SourceCodeParserMain.main(arrayOf(resource, "-out=table"))
        }

        assertThat(outputStream.lines()[0]).contains("Language", "Files", "LoC")
        assertThat(outputStream.lines()[1]).contains("------")
    }

    @Test
    @Throws(IOException::class)
    fun tabular_output_for_folder_has_correct_length() {
        val resource = "src/test/resources/$infrastructureBaseFolder/java"

        val (outputStream, _) = retrieveOutputAndErrorStream {
            SourceCodeParserMain.main(arrayOf(resource, "-out=table"))
        }

        assertThat(outputStream.lines().size).isEqualTo(2 + 1 + 2 + 1)//header+javacode+summary+trailing newline
    }

    @Test
    @Throws(IOException::class)
    fun tabular_output_for_folder_finds_one_java_file() {
        val resource = "src/test/resources/$infrastructureBaseFolder/java"

        val (outputStream, _) = retrieveOutputAndErrorStream {
            SourceCodeParserMain.main(arrayOf(resource, "-out=table"))
        }

        assertThat(elementsOf(outputStream.lines()[2])).containsExactly("Java", "1", "7")
    }

}