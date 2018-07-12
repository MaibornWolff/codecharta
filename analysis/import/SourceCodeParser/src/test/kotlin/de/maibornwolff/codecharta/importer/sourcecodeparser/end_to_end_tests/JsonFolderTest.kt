package de.maibornwolff.codecharta.importer.sourcecodeparser.end_to_end_tests

import de.maibornwolff.codecharta.importer.sourcecodeparser.SourceCodeParserMain
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.end2EndFolder
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.retrieveStreamAsString
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test


class JsonFolderTest {

    private val resource = "src/test/resources/$end2EndFolder/miniJavaProject"

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