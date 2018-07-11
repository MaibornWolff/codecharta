package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.baseFolder
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.IOException


class SourceCodeParserMainTest {

    private val resource = "$baseFolder/java/Foo.java"

    private val outputStream = retrieveStreamAsString {
        SourceCodeParserMain.mainWithOutputStream(it, arrayOf(resource, "-out=table"))
    }

    @Test
    @Throws(IOException::class)
    fun prints_working_directory_if_file_not_found() {
        assertThat(outputStream.lines()[0]).contains("working directory")
        assertThat(outputStream.lines()[1]).contains("Could not find")
    }

}