package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.baseFolder
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test


class SourceCodeParserMain_JsonFolderTest {

    private val resource = "src/test/resources/$baseFolder/miniJavaProject"

    private val outputStream = retrieveStreamAsString {
        SourceCodeParserMain.mainWithOutputStream(it, arrayOf(resource, "-out=json"))
    }

    @Test
    fun `json output has correct api version`() {
        assertThat(outputStream).containsOnlyOnce(""""apiVersion":"1.0"""")
    }

    @Test
    fun `json output has one root node`() {
        assertThat(outputStream).containsOnlyOnce(""""name":"root"""")
    }


}