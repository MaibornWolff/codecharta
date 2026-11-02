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
class RepoScanCommandTest {
    private val errContent = ByteArrayOutputStream()
    private val originalErr = System.err

    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should refuse real names without author ownership`() {
        // Arrange
        val commandLine = CommandLine(RepoScanCommand())
        val errors = StringWriter()
        commandLine.err = PrintWriter(errors)
        commandLine.setExecutionExceptionHandler { exception, _, _ ->
            errors.write(exception.message.orEmpty())
            1
        }

        // Act
        val exitCode = commandLine.execute("--repo-path=.", "--with-author-names")

        // Assert
        Assertions.assertThat(exitCode).isNotZero()
        Assertions.assertThat(errors.toString()).contains("--author-ownership")
    }

    @Test
    fun `should refuse a commit changes day that is no date`() {
        // Arrange
        val commandLine = CommandLine(RepoScanCommand())
        val errors = StringWriter()
        commandLine.err = PrintWriter(errors)

        // Act
        val exitCode = commandLine.execute("--repo-path=.", "--commit-changes-since=6 months ago")

        // Assert
        Assertions.assertThat(exitCode).isNotZero()
        Assertions.assertThat(errors.toString()).contains("--commit-changes-since")
    }

    @Test
    fun `should stop execution if input files are invalid`() {
        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false

        System.setErr(PrintStream(errContent))
        CommandLine(RepoScanCommand())
            .execute(
                "--repo-path=thisDoesNotExist"
            ).toString()
        System.setErr(originalErr)

        Assertions.assertThat(errContent.toString()).contains("Input invalid file for GitRepoScan, stopping execution")
    }
}
