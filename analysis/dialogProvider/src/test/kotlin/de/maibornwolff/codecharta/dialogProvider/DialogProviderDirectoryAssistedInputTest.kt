package de.maibornwolff.codecharta.dialogProvider

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.foundation.text.black
import com.varabyte.kotter.foundation.text.bold
import com.varabyte.kotter.foundation.text.green
import com.varabyte.kotter.foundation.text.invert
import com.varabyte.kotter.foundation.text.text
import com.varabyte.kotter.foundation.text.textLine
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.resolveRerenders
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import com.varabyte.kotterx.test.runtime.blockUntilRenderWhen
import com.varabyte.kotterx.test.runtime.stripFormatting
import com.varabyte.kotterx.test.terminal.assertMatches
import de.maibornwolff.codecharta.util.FileExtension
import io.mockk.every
import io.mockk.mockkObject
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.File

class DialogProviderDirectoryAssistedInputTest : DialogProviderTestBase() {
    @Test
    fun `should prompt file type correctly`() {
        var result: String
        val testFilePath = "src/test/resources"
        val inputFileName = "$testFilePath/valid.log"
        val inputFile = File(inputFileName)
        val testMessage = "What is the input file?"

        testSession { terminal ->
            result =
                promptDefaultDirectoryAssistedInput(InputType.FILE, listOf(), onInputReady = {
                    terminal.type(inputFile.toString())
                    terminal.press(Keys.ENTER)
                })
            assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                "? $testMessage",
                "> $inputFile ",
                ""
            )
            assertThat(result).isEqualTo(inputFile.toString())
        }
    }

    @Test
    fun `should prompt file extensions correctly`() {
        var result: String
        val testFilePath = "src/test/resources"
        val inputFileName = "$testFilePath/validExtension.cc.json"
        val inputFile = File(inputFileName)
        val testMessage = "What is the input [.cc.json] file?"

        testSession { terminal ->
            result =
                promptDefaultDirectoryAssistedInput(InputType.FILE, listOf(FileExtension.CCJSON), onInputReady = {
                    terminal.type(inputFile.toString())
                    terminal.press(Keys.ENTER)
                })
            assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                "? $testMessage",
                "> $inputFile ",
                ""
            )

            assertThat(result).isEqualTo(inputFile.toString())
        }
    }

    @Test
    fun `should prompt plural if multiple is set`() {
        var result: String
        val testFilePath = "src/test/resources"
        val inputFileName = "$testFilePath/valid.log"
        val inputFile = File(inputFileName)
        val testMessage = "What are the input file(s)? Enter multiple files comma separated."
        val initialHint = "build" + File.separatorChar
        val directoryContent = "build${File.separatorChar}           src${File.separatorChar}             build.gradle.kts"

        testSession { terminal ->
            result =
                promptDefaultDirectoryAssistedInput(InputType.FILE, listOf(), multiple = true, onInputReady = {
                    terminal.assertMatches {
                        bold {
                            green { text("? ") }
                            textLine(testMessage)
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
                    terminal.type(inputFile.toString())
                    terminal.press(Keys.ENTER)
                })
            assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                "? $testMessage",
                "> $inputFile ",
                ""
            )

            assertThat(result).isEqualTo(inputFile.toString())
        }
    }

    @Test
    fun `should prompt plural if multiple is set with file extension`() {
        var result: String
        val testFilePath = "src/test/resources"
        val inputFileName = "$testFilePath/validExtension.cc.json"
        val inputFile = File(inputFileName)
        val testMessage = "What are the input [.cc.json] file(s)? Enter multiple files comma separated."
        val initialHint = "build" + File.separatorChar
        val directoryContent = "build" + File.separatorChar + " src" + File.separatorChar

        testSession { terminal ->
            result =
                promptDefaultDirectoryAssistedInput(InputType.FILE, listOf(FileExtension.CCJSON), multiple = true, onInputReady = {
                    terminal.assertMatches {
                        bold {
                            green { text("? ") }
                            textLine(testMessage)
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
                    terminal.type(inputFile.toString())
                    terminal.press(Keys.ENTER)
                })
            assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                "? $testMessage",
                "> $inputFile ",
                ""
            )

            assertThat(result).isEqualTo(inputFile.toString())
        }
    }

    @Test
    fun `directoryNavigator should provide repeated auto-completion`() {
        var result: String
        val testFilePath = "src/test/resources"
        val inputFileName = "$testFilePath/validExtension.cc.json"
        val testMessage = "What are the input folder(s) or [.cc.json] file(s)? Enter multiple files comma separated."
        val slash = File.separatorChar
        val initialHint = "build$slash"
        val directoryContent = "build$slash src$slash"

        mockkObject(InputValidator)
        every { InputValidator.isFileOrFolderValid(any(), any()) } returns { true }

        testSession { terminal ->
            result =
                promptDefaultDirectoryAssistedInput(
                    InputType.FOLDER_AND_FILE,
                    listOf(FileExtension.CCJSON),
                    multiple = true,
                    onInputReady = {
                        terminal.assertMatches {
                            bold {
                                green { text("? ") }
                                textLine(testMessage)
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
                        val blockUntilCompletionIsOffered: (String) -> Unit = { completedInput ->
                            blockUntilRenderWhen {
                                terminal.resolveRerenders().stripFormatting().any { it.startsWith("> $completedInput") }
                            }
                        }
                        terminal.type("sr")
                        blockUntilCompletionIsOffered("src$slash")
                        terminal.press(Keys.RIGHT)
                        terminal.type("test${slash}resour")
                        blockUntilCompletionIsOffered("src${slash}test${slash}resources$slash")
                        terminal.press(Keys.RIGHT)
                        terminal.type("valid")
                        blockUntilCompletionIsOffered(File(inputFileName).toString())
                        terminal.press(Keys.RIGHT)
                        terminal.press(Keys.ENTER)
                    }
                )
            assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                "? $testMessage",
                "> ${File(inputFileName)} ",
                ""
            )
            assertThat(result).isEqualTo(File(inputFileName).toString())
        }
    }

    @Test
    fun `should clean hints from terminal if an input is accepted`() {
        var result: String
        val testFilePath = "src/test/"
        val testMessage = "What is the input folder?"
        val slash = File.separatorChar
        val initialHint = "build$slash"
        val directoryContent = "build$slash src$slash"

        testSession { terminal ->
            result =
                promptDefaultDirectoryAssistedInput(
                    InputType.FOLDER,
                    listOf(),
                    multiple = false,
                    onInputReady = {
                        terminal.assertMatches {
                            bold {
                                green { text("? ") }
                                textLine(testMessage)
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
                        terminal.type("sr")
                        terminal.press(Keys.RIGHT)
                        terminal.type("test$slash")
                        terminal.press(Keys.ENTER)
                    }
                )
            assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                "? $testMessage",
                "> ${File(testFilePath)}$slash ",
                ""
            )
            assertThat(result).isEqualTo(File(testFilePath).toString() + slash)
        }
    }
}
