package de.maibornwolff.codecharta.dialogProvider

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.foundation.text.black
import com.varabyte.kotter.foundation.text.bold
import com.varabyte.kotter.foundation.text.green
import com.varabyte.kotter.foundation.text.invert
import com.varabyte.kotter.foundation.text.text
import com.varabyte.kotter.foundation.text.textLine
import com.varabyte.kotter.runtime.terminal.inmemory.InMemoryTerminal
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import com.varabyte.kotterx.test.terminal.assertMatches
import de.maibornwolff.codecharta.dialogProvider.PromptTestFixtures.renderedLines
import de.maibornwolff.codecharta.serialization.FileExtension
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.Arguments.argumentSet
import org.junit.jupiter.params.provider.MethodSource
import java.io.File

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class DefaultDirectoryAssistedInputTest {
    private val slash = File.separatorChar
    private val validLog = File("src/test/resources/valid.log")
    private val validCcJson = File("src/test/resources/validExtension.cc.json")
    private val initialHint = "build$slash"

    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    private fun InMemoryTerminal.assertShowsDirectoryHints(message: String, directoryContent: String) {
        assertMatches {
            bold {
                green { text("? ") }
                textLine(message)
            }
            text("> ")
            black(isBright = true) {
                invert { text(initialHint[0]) }
                text("${initialHint.drop(1)} ")
            }
            text("\n")
            black(isBright = true) {
                text(directoryContent)
            }
        }
    }

    private fun singleFileCases(): List<Arguments> = listOf(
        argumentSet("file type without extensions", emptyList<FileExtension>(), validLog, "What is the input file?"),
        argumentSet("file extensions", listOf(FileExtension.CCJSON), validCcJson, "What is the input [.cc.json] file?")
    )

    @ParameterizedTest
    @MethodSource("singleFileCases")
    fun `should prompt for a single file correctly`(fileExtensions: List<FileExtension>, inputFile: File, expectedMessage: String) {
        testSession { terminal ->
            // Act
            val result = promptDefaultDirectoryAssistedInput(InputType.FILE, fileExtensions, onInputReady = {
                terminal.type(inputFile.toString())
                terminal.press(Keys.ENTER)
            })

            // Assert
            assertThat(terminal.renderedLines()).containsExactly("? $expectedMessage", "> $inputFile ", "")
            assertThat(result).isEqualTo(inputFile.toString())
        }
    }

    private fun multipleFileCases(): List<Arguments> = listOf(
        argumentSet(
            "file type without extensions",
            emptyList<FileExtension>(),
            validLog,
            "What are the input file(s)? Enter multiple files comma separated.",
            "build$slash           src$slash             build.gradle.kts"
        ),
        argumentSet(
            "file extensions",
            listOf(FileExtension.CCJSON),
            validCcJson,
            "What are the input [.cc.json] file(s)? Enter multiple files comma separated.",
            "build$slash src$slash"
        )
    )

    @ParameterizedTest
    @MethodSource("multipleFileCases")
    fun `should prompt plural and show matching directory entries if multiple is set`(
        fileExtensions: List<FileExtension>,
        inputFile: File,
        expectedMessage: String,
        expectedDirectoryContent: String
    ) {
        testSession { terminal ->
            // Act
            val result = promptDefaultDirectoryAssistedInput(InputType.FILE, fileExtensions, multiple = true, onInputReady = {
                // Assert
                terminal.assertShowsDirectoryHints(expectedMessage, expectedDirectoryContent)
                terminal.type(inputFile.toString())
                terminal.press(Keys.ENTER)
            })

            // Assert
            assertThat(terminal.renderedLines()).containsExactly("? $expectedMessage", "> $inputFile ", "")
            assertThat(result).isEqualTo(inputFile.toString())
        }
    }

    @Test
    fun `should provide repeated auto-completion`() {
        // Arrange
        val testMessage = "What are the input folder(s) or [.cc.json] file(s)? Enter multiple files comma separated."
        mockkObject(InputValidator)
        every { InputValidator.isFileOrFolderValid(any(), any()) } returns { true }

        testSession { terminal ->
            // Act
            val result = promptDefaultDirectoryAssistedInput(
                InputType.FOLDER_AND_FILE,
                listOf(FileExtension.CCJSON),
                multiple = true,
                onInputReady = {
                    terminal.assertShowsDirectoryHints(testMessage, "build$slash src$slash")
                    terminal.type("sr")
                    terminal.press(Keys.RIGHT)
                    terminal.type("test${slash}resour")
                    terminal.press(Keys.RIGHT)
                    terminal.type("valid")
                    terminal.press(Keys.RIGHT)
                    terminal.press(Keys.ENTER)
                }
            )

            // Assert
            assertThat(terminal.renderedLines()).containsExactly("? $testMessage", "> $validCcJson ", "")
            assertThat(result).isEqualTo(validCcJson.toString())
        }
    }

    @Test
    fun `should clean hints from terminal if an input is accepted`() {
        // Arrange
        val testFilePath = "src/test/"
        val testMessage = "What is the input folder?"

        testSession { terminal ->
            // Act
            val result = promptDefaultDirectoryAssistedInput(InputType.FOLDER, listOf(), multiple = false, onInputReady = {
                terminal.assertShowsDirectoryHints(testMessage, "build$slash src$slash")
                terminal.type("sr")
                terminal.press(Keys.RIGHT)
                terminal.type("test$slash")
                terminal.press(Keys.ENTER)
            })

            // Assert
            assertThat(terminal.renderedLines()).containsExactly("? $testMessage", "> ${File(testFilePath)}$slash ", "")
            assertThat(result).isEqualTo(File(testFilePath).toString() + slash)
        }
    }
}
