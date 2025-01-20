package de.maibornwolff.codecharta.importer.tokeiimporter

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.importer.tokeiimporter.ParserDialog.Companion.myCollectParserArgs
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.Timeout
import picocli.CommandLine
import java.io.File

@Timeout(120)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ParserDialogTest {
    private val testResourceBaseFolder = "src/test/resources/"
    private val inputFileName = "${testResourceBaseFolder}tokei_12_minimal.json"
    private val outputFileName = "out.cc.json"
    private val rootFolder = "/foo/bar"

    @Test
    fun `should output correct arguments when valid input is provided`() { // given
        val pathSeparator = "/"
        val isCompressed = false

        testSession { terminal ->
            val parserArguments = myCollectParserArgs(
                fileCallback = {
                    terminal.type(inputFileName)
                    terminal.press(Keys.ENTER)
                },
                outFileCallback = {
                    terminal.type(outputFileName)
                    terminal.press(Keys.ENTER)
                },
                rootCallback = {
                    terminal.type(rootFolder)
                    terminal.press(Keys.ENTER)
                },
                pathCallback = {
                    terminal.type(pathSeparator)
                    terminal.press(Keys.ENTER)
                },
                compressCallback = {
                    terminal.press(Keys.RIGHT)
                    terminal.press(Keys.ENTER)
                }
            )

            val cmdLine = CommandLine(TokeiImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(File(inputFileName).name)
            assertThat(parseResult.matchedOption("output-file").getValue<String>().equals(outputFileName))
            assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
            assertThat(parseResult.matchedOption("root-name").getValue<String>()).isEqualTo(rootFolder)
            assertThat(parseResult.matchedOption("path-separator").getValue<String>()).isEqualTo(pathSeparator)
        }
    }

    @Test
    fun `should escape a single backslash`() { // given
        val pathSeparator = "\\"
        val pathSeparatorEscaped = "\\\\"
        val isCompressed = false

        testSession { terminal ->
            val parserArguments = myCollectParserArgs(
                fileCallback = {
                    terminal.type(inputFileName)
                    terminal.press(Keys.ENTER)
                },
                outFileCallback = {
                    terminal.type(outputFileName)
                    terminal.press(Keys.ENTER)
                },
                rootCallback = {
                    terminal.type(rootFolder)
                    terminal.press(Keys.ENTER)
                },
                pathCallback = {
                    terminal.type(pathSeparator)
                    terminal.press(Keys.ENTER)
                },
                compressCallback = {
                    terminal.press(Keys.RIGHT)
                    terminal.press(Keys.ENTER)
                }
            )

            val cmdLine = CommandLine(TokeiImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(File(inputFileName).name)
            assertThat(parseResult.matchedOption("output-file").getValue<String>().equals(outputFileName))
            assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
            assertThat(parseResult.matchedOption("root-name").getValue<String>()).isEqualTo(rootFolder)
            assertThat(parseResult.matchedOption("path-separator").getValue<String>())
                .isEqualTo(pathSeparatorEscaped)
        }
    }

    @Test
    fun `should not escape a double backslash`() {
        val pathSeparator = "\\\\"
        val isCompressed = false

        testSession { terminal ->
            val parserArguments = myCollectParserArgs(
                fileCallback = {
                    terminal.type(inputFileName)
                    terminal.press(Keys.ENTER)
                },
                outFileCallback = {
                    terminal.type(outputFileName)
                    terminal.press(Keys.ENTER)
                },
                rootCallback = {
                    terminal.type(rootFolder)
                    terminal.press(Keys.ENTER)
                },
                pathCallback = {
                    terminal.type(pathSeparator)
                    terminal.press(Keys.ENTER)
                },
                compressCallback = {
                    terminal.press(Keys.RIGHT)
                    terminal.press(Keys.ENTER)
                }
            )

            val cmdLine = CommandLine(TokeiImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(File(inputFileName).name)
            assertThat(parseResult.matchedOption("output-file").getValue<String>().equals(outputFileName))
            assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
            assertThat(parseResult.matchedOption("root-name").getValue<String>()).isEqualTo(rootFolder)
            assertThat(parseResult.matchedOption("path-separator").getValue<String>()).isEqualTo(pathSeparator)
        }
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        val invalidFileName = "inv"
        val pathSeparator = "/"

        testSession { terminal ->
            val parserArguments = myCollectParserArgs(
                fileCallback = {
                    terminal.type(invalidFileName)
                    terminal.press(Keys.ENTER)
                    terminal.press(Keys.BACKSPACE, Keys.BACKSPACE, Keys.BACKSPACE)
                    terminal.type(inputFileName)
                    terminal.press(Keys.ENTER)
                },
                outFileCallback = {
                    terminal.type(outputFileName)
                    terminal.press(Keys.ENTER)
                },
                rootCallback = {
                    terminal.type(rootFolder)
                    terminal.press(Keys.ENTER)
                },
                pathCallback = {
                    terminal.type(pathSeparator)
                    terminal.press(Keys.ENTER)
                },
                compressCallback = {
                    terminal.press(Keys.RIGHT)
                    terminal.press(Keys.ENTER)
                }
            )

            val cmdLine = CommandLine(TokeiImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(File(inputFileName).name)
        }
    }
}
