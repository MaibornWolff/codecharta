package de.maibornwolff.codecharta.analysers.tools.analyse

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class SvnLogWriterTest {
    @TempDir
    lateinit var workingCopy: File

    private val logFile get() = File(workingCopy, "svn.log")

    @Test
    fun `should write what the command prints into the log file`() {
        // Arrange
        val writer = SvnLogWriter(listOf("echo", "r1 | alice"))

        // Act
        val failure = writer.write(workingCopy, logFile)

        // Assert
        assertThat(failure).isNull()
        assertThat(logFile.readText()).isEqualTo("r1 | alice\n")
    }

    @Test
    fun `should name the command when it is not installed`() {
        // Arrange
        val writer = SvnLogWriter(listOf("codecharta-no-such-svn", "log"))

        // Act
        val failure = writer.write(workingCopy, logFile)

        // Assert
        assertThat(failure).isEqualTo("the codecharta-no-such-svn command is not installed or not on the PATH")
    }

    @Test
    fun `should name the first error line when the command fails`() {
        // Arrange
        val writer = SvnLogWriter(listOf("sh", "-c", "echo 'svn: E155007: not a working copy' >&2; exit 1"))

        // Act
        val failure = writer.write(workingCopy, logFile)

        // Assert
        assertThat(failure).endsWith("failed: svn: E155007: not a working copy")
    }
}
