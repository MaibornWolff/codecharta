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
                listOf(
                    typeText(terminal, projectFolder.path),
                    typeText(terminal, "shop.cc.json"),
                    typeText(terminal, "generated,vendor"),
                    typeText(terminal, "")
                )
            arguments = collectAnalyserArgs(this)
        }

        // Assert
        assertThat(arguments).containsExactly(projectFolder.path, "--output-file=shop.cc.json", "--exclude=generated,vendor")
    }

    @Test
    fun `should add author ownership only when it is chosen`() {
        // Arrange
        mockkObject(Dialog.Companion)
        var arguments: List<String> = emptyList()

        // Act
        testSession { terminal ->
            val pressYes: suspend RunScope.() -> Unit = { terminal.press(Keys.LEFT, Keys.ENTER) }
            every { Dialog.Companion.testCallback() } returnsMany
                listOf(
                    typeText(terminal, projectFolder.path),
                    typeText(terminal, ""),
                    typeText(terminal, ""),
                    pressYes,
                    typeText(terminal, ""),
                    typeText(terminal, "")
                )
            arguments = collectAnalyserArgs(this)
        }

        // Assert
        assertThat(arguments).containsExactly(projectFolder.path, "--author-ownership")
    }

    @Test
    fun `should add commit changes only when a day is entered`() {
        // Arrange
        mockkObject(Dialog.Companion)
        var arguments: List<String> = emptyList()

        // Act
        testSession { terminal ->
            every { Dialog.Companion.testCallback() } returnsMany
                listOf(
                    typeText(terminal, projectFolder.path),
                    typeText(terminal, ""),
                    typeText(terminal, ""),
                    { terminal.press(Keys.ENTER) },
                    typeText(terminal, "2026-01-31"),
                    typeText(terminal, "")
                )
            arguments = collectAnalyserArgs(this)
        }

        // Assert
        assertThat(arguments).containsExactly(projectFolder.path, "--commit-changes-since=2026-01-31")
    }

    @Test
    fun `should add real names only when they are chosen as well`() {
        // Arrange
        mockkObject(Dialog.Companion)
        var arguments: List<String> = emptyList()

        // Act
        testSession { terminal ->
            val pressYes: suspend RunScope.() -> Unit = { terminal.press(Keys.LEFT, Keys.ENTER) }
            every { Dialog.Companion.testCallback() } returnsMany
                listOf(
                    typeText(terminal, projectFolder.path),
                    typeText(terminal, ""),
                    typeText(terminal, ""),
                    pressYes,
                    pressYes,
                    typeText(terminal, "")
                )
            arguments = collectAnalyserArgs(this)
        }

        // Assert
        assertThat(arguments).containsExactly(projectFolder.path, "--author-ownership", "--with-author-names")
    }

    @Test
    fun `should add the SBOM whose path was typed`() {
        // Arrange
        mockkObject(Dialog.Companion)
        var arguments: List<String> = emptyList()

        // Act
        testSession { terminal ->
            every { Dialog.Companion.testCallback() } returnsMany
                listOf(
                    typeText(terminal, projectFolder.path),
                    typeText(terminal, ""),
                    typeText(terminal, ""),
                    { terminal.press(Keys.ENTER) },
                    typeText(terminal, ""),
                    typeText(terminal, "bom.cdx.json")
                )
            arguments = collectAnalyserArgs(this)
        }

        // Assert
        assertThat(arguments).containsExactly(projectFolder.path, "--sbom=bom.cdx.json")
    }

    private fun typeText(terminal: InMemoryTerminal, text: String): suspend RunScope.() -> Unit = {
        terminal.type(text)
        terminal.press(Keys.ENTER)
    }
}
