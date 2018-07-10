package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.baseFolder
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.ByteArrayOutputStream
import java.io.IOException


class SourceCodeParserMainTest {


    @Test
    @Throws(IOException::class)
    fun prints_working_directory_if_file_not_found() {
        val resource = "$baseFolder/java/Foo.java"

        val outputStream = retrieveStreamAsString {
            SourceCodeParserMain.mainWithOutputStream(it, arrayOf(resource))
        }

        assertThat(outputStream.lines()[0]).contains("working directory")
        assertThat(outputStream.lines()[1]).contains("Could not find")
    }

}