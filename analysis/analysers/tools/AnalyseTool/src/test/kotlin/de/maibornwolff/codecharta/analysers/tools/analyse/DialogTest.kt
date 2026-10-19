package de.maibornwolff.codecharta.analysers.tools.analyse

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.terminal.inmemory.InMemoryTerminal
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.analysers.tools.analyse.Dialog.Companion.collectAnalyserArgs
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
    fun `should pass only the folder when output file and exclude are left empty`() {
        // Arrange
        mockkObject(Dialog.Companion)
        var arguments: List<String> = emptyList()

        // Act
        testSession { terminal ->
            every { Dialog.Companion.testCallback() } returnsMany
                listOf(typeText(terminal, projectFolder.path), typeText(terminal, ""), typeText(terminal, ""))
            arguments = collectAnalyserArgs(this)
        }

        // Assert
        assertThat(arguments).containsExactly(projectFolder.path)
    }

    @Test
    fun `should pass the output file and the exclude patterns that were typed`() {
        // Arrange
        mockkObject(Dialog.Companion)
        var arguments: List<String> = emptyList()

        // Act
        testSession { terminal ->
            every { Dialog.Companion.testCallback() } returnsMany
                listOf(typeText(terminal, projectFolder.path), typeText(terminal, "shop.cc.json"), typeText(terminal, "generated,vendor"))
            arguments = collectAnalyserArgs(this)
        }

        // Assert
        assertThat(arguments).containsExactly(projectFolder.path, "--output-file=shop.cc.json", "--exclude=generated,vendor")
    }

    private fun typeText(terminal: InMemoryTerminal, text: String): suspend RunScope.() -> Unit = {
        terminal.type(text)
        terminal.press(Keys.ENTER)
    }
}
