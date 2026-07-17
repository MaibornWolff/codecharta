package de.maibornwolff.codecharta.analysers.parsers.gitlog.parser.git.helper

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class GitPathUnquoterTest {
    @Test
    fun `should return an unquoted path unchanged`() {
        assertThat(GitPathUnquoter.unquote("src/main/Main.kt")).isEqualTo("src/main/Main.kt")
    }

    @Test
    fun `should return a path unchanged when it is not fully double-quoted`() {
        assertThat(GitPathUnquoter.unquote("\"only-leading-quote")).isEqualTo("\"only-leading-quote")
        assertThat(GitPathUnquoter.unquote("only-trailing-quote\"")).isEqualTo("only-trailing-quote\"")
    }

    @Test
    fun `should only strip the quotes when there are no escapes`() {
        assertThat(GitPathUnquoter.unquote("\".github/workflows/ci.yml\"")).isEqualTo(".github/workflows/ci.yml")
    }

    @Test
    fun `should decode octal escapes of a multi-byte character back to UTF-8`() {
        // git C-quotes the emoji U+1F52C as its four UTF-8 bytes \360\237\224\254
        val quoted = "\"\\360\\237\\224\\254-research.md\""
        assertThat(GitPathUnquoter.unquote(quoted)).isEqualTo("🔬-research.md")
    }

    @Test
    fun `should decode an escaped quote and backslash`() {
        assertThat(GitPathUnquoter.unquote("\"weird\\\"name.txt\"")).isEqualTo("weird\"name.txt")
        assertThat(GitPathUnquoter.unquote("\"a\\\\b.txt\"")).isEqualTo("a\\b.txt")
    }

    @Test
    fun `should decode the standard C control escapes`() {
        assertThat(decodedMiddleChar("\"x\\ty\"")).isEqualTo(9)
        assertThat(decodedMiddleChar("\"x\\ny\"")).isEqualTo(10)
        assertThat(decodedMiddleChar("\"x\\ry\"")).isEqualTo(13)
        assertThat(decodedMiddleChar("\"x\\ay\"")).isEqualTo(7)
        assertThat(decodedMiddleChar("\"x\\by\"")).isEqualTo(8)
        assertThat(decodedMiddleChar("\"x\\fy\"")).isEqualTo(12)
        assertThat(decodedMiddleChar("\"x\\vy\"")).isEqualTo(11)
    }

    private fun decodedMiddleChar(quoted: String): Int = GitPathUnquoter.unquote(quoted)[1].code
}
