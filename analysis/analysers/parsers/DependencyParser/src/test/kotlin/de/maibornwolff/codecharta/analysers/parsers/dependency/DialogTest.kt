package de.maibornwolff.codecharta.analysers.parsers.dependency

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.terminal.inmemory.InMemoryTerminal
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.analysers.parsers.dependency.Dialog.Companion.collectAnalyserArgs
import io.mockk.every
import io.mockk.mockkObject
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.Timeout
import org.junit.jupiter.api.io.TempDir
import picocli.CommandLine
import java.io.File
import java.nio.file.Path
import kotlin.io.path.writeText

@Timeout(120)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class DialogTest {
    private val outputFileName = "test.cc.json"

    @Test
    fun `should output correct arguments when provided with valid input`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val inputFileName = sourceFile(tempDir)
        mockkObject(Dialog.Companion)
        var parserArguments: List<String> = emptyList()

        // Act
        testSession { terminal ->
            every { Dialog.testCallback() } returnsMany listOf(
                terminal.typing(inputFileName),
                terminal.typing(outputFileName),
                terminal.answeringNo(), // compress
                terminal.answeringNo(), // suppress command line output
                terminal.answeringNo(), // exclude .gitignore entries
                terminal.answeringYes(), // include test files
                terminal.answeringYes(), // omit graph analysis
                terminal.typing("512"), // max file size
                terminal.typing("30") // file timeout
            )
            parserArguments = collectAnalyserArgs(this)
        }
        val parseResult = CommandLine(DependencyParser()).parseArgs(*parserArguments.toTypedArray())

        // Assert
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.hasMatchedOption("not-compressed")).isTrue()
        assertThat(parseResult.matchedOption("verbose").getValue<Boolean>()).isTrue()
        assertThat(parseResult.hasMatchedOption("bypass-gitignore")).isTrue()
        assertThat(parseResult.hasMatchedOption("include-tests")).isTrue()
        assertThat(parseResult.hasMatchedOption("omit-graph-analysis")).isTrue()
        assertThat(parseResult.matchedOption("max-file-size").getValue<Int>()).isEqualTo(512)
        assertThat(parseResult.matchedOption("file-timeout").getValue<Int>()).isEqualTo(30)
        assertThat(parseResult.matchedPositional(0).getValue<List<File>>().first().name).isEqualTo(File(inputFileName).name)
    }

    @Test
    fun `should omit the optional flags and limits that were declined`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val inputFileName = sourceFile(tempDir)
        mockkObject(Dialog.Companion)
        var parserArguments: List<String> = emptyList()

        // Act
        testSession { terminal ->
            every { Dialog.testCallback() } returnsMany listOf(
                terminal.typing(inputFileName),
                terminal.typing(""), // no output file, so the compress question is skipped
                terminal.answeringNo(), // suppress command line output
                terminal.answeringYes(), // exclude .gitignore entries
                terminal.answeringNo(), // include test files
                terminal.answeringNo(), // omit graph analysis
                terminal.typing(""), // no max file size
                terminal.typing("") // no file timeout
            )
            parserArguments = collectAnalyserArgs(this)
        }

        // Assert
        assertThat(parserArguments).noneMatch { it.startsWith("--include-tests") }
        assertThat(parserArguments).noneMatch { it.startsWith("--omit-graph-analysis") }
        assertThat(parserArguments).noneMatch { it.startsWith("--max-file-size") }
        assertThat(parserArguments).noneMatch { it.startsWith("--file-timeout") }
        assertThat(parserArguments).noneMatch { it.startsWith("--bypass-gitignore") }
    }

    private fun sourceFile(tempDir: Path): String {
        val file = tempDir.resolve("Service.kt")
        file.writeText("class Service")
        return file.toString()
    }
}

private fun InMemoryTerminal.typing(text: String): suspend RunScope.() -> Unit = {
    if (text.isNotEmpty()) type(text)
    press(Keys.ENTER)
}

private fun InMemoryTerminal.answeringYes(): suspend RunScope.() -> Unit = {
    press(Keys.ENTER)
}

private fun InMemoryTerminal.answeringNo(): suspend RunScope.() -> Unit = {
    press(Keys.RIGHT)
    press(Keys.ENTER)
}
