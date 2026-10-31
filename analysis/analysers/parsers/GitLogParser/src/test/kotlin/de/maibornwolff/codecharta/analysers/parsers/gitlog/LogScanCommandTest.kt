package de.maibornwolff.codecharta.analysers.parsers.gitlog

import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.PrintStream
import java.io.PrintWriter
import java.io.StringWriter

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class LogScanCommandTest {
    private val errContent = ByteArrayOutputStream()
    private val originalErr = System.err

    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should reject author ownership with a hint to repo-scan`() {
        // Arrange
        val commandLine = CommandLine(LogScanCommand())
        val errors = StringWriter()
        commandLine.err = PrintWriter(errors)

        // Act
        val exitCode = commandLine.execute("--git-log=any.log", "--repo-files=any.txt", "--author-ownership")

        // Assert
        Assertions.assertThat(exitCode).isNotZero()
        Assertions.assertThat(errors.toString()).contains("repo-scan --author-ownership")
    }

    @Test
    fun `should stop execution if input files are invalid`() {
        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false

        System.setErr(PrintStream(errContent))
        CommandLine(LogScanCommand())
            .execute(
                "--git-log=thisDoesNotExist.cc.json",
                "--repo-files=thisDoesNotExist"
            ).toString()
        System.setErr(originalErr)

        Assertions.assertThat(errContent.toString()).contains("Input invalid file for GitLogScan, stopping execution")
    }
}
