package de.maibornwolff.codecharta.analysers.parsers.gitlog

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.File

class GitLogEncodingTest {
    private fun tempLog(bytes: ByteArray): File {
        val file = File.createTempFile("git", ".log")
        file.deleteOnExit()
        file.writeBytes(bytes)
        return file
    }

    @Test
    fun `should report a valid UTF-8 multi-byte log as valid`() {
        val file = tempLog("commit abc\n10\t5\t🔬-research.md\n".toByteArray(Charsets.UTF_8))
        assertThat(GitLogParser.isValidUtf8(file)).isTrue()
    }

    @Test
    fun `should report a log with an invalid UTF-8 byte as not valid`() {
        // 0xE9 (a lone Latin-1 e-acute) is not a valid UTF-8 sequence
        val file = tempLog(byteArrayOf('a'.code.toByte(), 0xE9.toByte(), 'b'.code.toByte()))
        assertThat(GitLogParser.isValidUtf8(file)).isFalse()
    }

    @Test
    fun `should validate a multi-byte character that straddles the chunk boundary`() {
        // 8191 ASCII bytes then a 2-byte UTF-8 character, so the character spans the 8192-byte read chunk
        val prefix = "a".repeat(8191).toByteArray(Charsets.UTF_8)
        val multiByte = "é".toByteArray(Charsets.UTF_8) // 0xC3 0xA9
        val file = tempLog(prefix + multiByte)
        assertThat(GitLogParser.isValidUtf8(file)).isTrue()
    }

    @Test
    fun `should reject a truncated multi-byte sequence at end of file`() {
        // 0xC3 is the lead byte of a 2-byte sequence with no following continuation byte
        val file = tempLog("ok".toByteArray(Charsets.UTF_8) + byteArrayOf(0xC3.toByte()))
        assertThat(GitLogParser.isValidUtf8(file)).isFalse()
    }

    @Test
    fun `should choose UTF-8 for a valid UTF-8 log`() {
        val file = tempLog("commit abc\n10\t5\tsrc/🔬.kt\n".toByteArray(Charsets.UTF_8))
        assertThat(GitLogParser.determineLogEncoding(file)).isEqualTo("UTF-8")
    }
}
