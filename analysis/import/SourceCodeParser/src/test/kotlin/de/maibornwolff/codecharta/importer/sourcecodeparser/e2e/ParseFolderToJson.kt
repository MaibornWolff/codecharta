package de.maibornwolff.codecharta.importer.sourcecodeparser.e2e

import de.maibornwolff.codecharta.importer.sourcecodeparser.SourceCodeParserMain
import de.maibornwolff.codecharta.importer.sourcecodeparser.e2e.StreamHelper.Companion.retrieveStreamAsString
import org.junit.Test
import org.assertj.core.api.Assertions.assertThat

class ParseFolderToJson {
    private val resource = "src/test/resources/sampleproject"
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
            """"name":"sampleproject""""
        )
    }

    @Test
    fun `json output does contain files`() {
        assertThat(output).contains(
            """"name":"foo.java""",
            """"name":"hello.java"""
        )
    }

    @Test
    fun `json output does contain file metrics`() {
        assertThat(output).contains(
            """"rloc":44""",
            """"rloc":6""",
            """"rloc":31"""
        )
    }
}