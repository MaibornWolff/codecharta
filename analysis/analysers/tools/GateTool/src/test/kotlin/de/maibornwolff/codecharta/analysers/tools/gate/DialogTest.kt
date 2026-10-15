package de.maibornwolff.codecharta.analysers.tools.gate

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.terminal.inmemory.InMemoryTerminal
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.analysers.tools.gate.Dialog.Companion.collectAnalyserArgs
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Timeout
import org.junit.jupiter.api.io.TempDir
import java.io.File

@Timeout(120)
class DialogTest {
    @TempDir
    lateinit var projectFolder: File

    @AfterEach
    fun tearDown() {
        unmockkAll()
    }

    @Test
    fun `should pass only the folder when checking the project is chosen`() {
        // Arrange
        mockkObject(Dialog.Companion)
        var arguments: List<String> = emptyList()

        // Act
        testSession { terminal ->
            every { Dialog.Companion.testCallback() } returnsMany listOf(choose(terminal, downPresses = 0), typeFolder(terminal))
            arguments = collectAnalyserArgs(this)
        }

        // Assert
        assertThat(arguments).containsExactly(projectFolder.path)
    }

    @Test
    fun `should pass the subcommand before the folder when doctor is chosen`() {
        // Arrange
        mockkObject(Dialog.Companion)
        var arguments: List<String> = emptyList()

        // Act
        testSession { terminal ->
            every { Dialog.Companion.testCallback() } returnsMany listOf(choose(terminal, downPresses = 2), typeFolder(terminal))
            arguments = collectAnalyserArgs(this)
        }

        // Assert
        assertThat(arguments).containsExactly("doctor", projectFolder.path)
    }

    private fun choose(terminal: InMemoryTerminal, downPresses: Int): suspend RunScope.() -> Unit = {
        repeat(downPresses) { terminal.press(Keys.DOWN) }
        terminal.press(Keys.ENTER)
    }

    private fun typeFolder(terminal: InMemoryTerminal): suspend RunScope.() -> Unit = {
        terminal.type(projectFolder.path)
        terminal.press(Keys.ENTER)
    }
}
