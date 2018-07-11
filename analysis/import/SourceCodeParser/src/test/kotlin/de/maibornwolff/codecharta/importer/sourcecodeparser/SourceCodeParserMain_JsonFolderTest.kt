package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.baseFolder
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.IOException


class SourceCodeParserMain_JsonFolderTest {

    private val resource = "src/test/resources/$baseFolder/miniJavaProject"

    private val outputStream = retrieveStreamAsString {
        SourceCodeParserMain.mainWithOutputStream(it, arrayOf(resource, "-out=json"))
    }

    @Test
    @Throws(IOException::class)
    fun `json output has correct api version`() {
        println(outputStream)
        assertThat(outputStream.lines()[0]).contains("apiVersion='1.0'")
    }


}