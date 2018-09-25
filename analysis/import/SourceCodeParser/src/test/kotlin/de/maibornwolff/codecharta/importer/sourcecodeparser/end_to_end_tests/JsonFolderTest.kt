package de.maibornwolff.codecharta.importer.sourcecodeparser.end_to_end_tests

import de.maibornwolff.codecharta.importer.sourcecodeparser.SourceCodeParserMain
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.end2EndFolder
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.retrieveStreamAsString
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test


class JsonFolderTest {

    private val resource = "src/test/../test/resources/$end2EndFolder/biggerJavaProject/."

    private val output = retrieveStreamAsString {
        SourceCodeParserMain.mainWithOutputStream(it, arrayOf(resource, "--format=json"))
    }

    @Test
    fun `json output has one root node`() {
        assertThat(output).containsOnlyOnce(""""name":"root"""")
    }

    @Test
    fun `json output does not contains source path, because we don't care about that information`() {
        assertThat(output).doesNotContain(
                """"name":"src"""",
                """"name":"test"""",
                """"name":"resources"""",
                """"name":"biggerJavaProject""""
        )
    }

    @Test
    fun `json output contains the path relative to the source path`() {
        assertThat(output).contains(
                """"name":"de"""",
                """"name":"foo""""
        )
    }

}