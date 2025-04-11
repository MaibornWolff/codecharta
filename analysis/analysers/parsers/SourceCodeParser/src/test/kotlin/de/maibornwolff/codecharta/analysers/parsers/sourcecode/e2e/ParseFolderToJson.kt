package de.maibornwolff.codecharta.analysers.parsers.sourcecode.e2e

import de.maibornwolff.codecharta.analysers.parsers.sourcecode.SourceCodeParser
import de.maibornwolff.codecharta.analysers.parsers.sourcecode.e2e.StreamHelper.Companion.retrieveStreamAsString
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class ParseFolderToJson {
    private val resource = "src/test/resources/sampleproject"

    private val output =
        retrieveStreamAsString {
            SourceCodeParser.mainWithOutputStream(it, arrayOf(resource, "--format=json", "-nc"))
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
            """"rloc":39""",
            """"rloc":6""",
            """"rloc":29"""
        )
    }
}
