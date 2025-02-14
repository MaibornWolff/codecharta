package de.maibornwolff.codecharta.importer.sourcemonitor

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.importer.sourcemonitor.ParserDialog.Companion.myCollectParserArgs
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
    private val inputFileName = "${testResourceBaseFolder}sourcemonitor.csv"
    private val outputFileName = "out.cc.json"

    @Test
    fun `should output correct arguments`() {
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
                compressCallback = {
                    terminal.press(Keys.ENTER)
                }
            )
            val cmdLine = CommandLine(SourceMonitorImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("not-compressed")).isNull()
            assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[0].name).isEqualTo(File(inputFileName).name)
        }
    }

    @Test
    fun `should output correct arguments not compressed`() {
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
                compressCallback = {
                    terminal.press(Keys.RIGHT)
                    terminal.press(Keys.ENTER)
                }
            )
            val cmdLine = CommandLine(SourceMonitorImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
            assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[0].name).isEqualTo(File(inputFileName).name)
        }
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        val invalidFileName = "inv"

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
                compressCallback = {
                    terminal.press(Keys.RIGHT)
                    terminal.press(Keys.ENTER)
                }
            )
            val cmdLine = CommandLine(SourceMonitorImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[0].name)
                .isEqualTo(File(inputFileName).name)
        }
    }
}
