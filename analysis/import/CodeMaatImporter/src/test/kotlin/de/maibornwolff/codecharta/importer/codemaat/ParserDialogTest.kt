package de.maibornwolff.codecharta.importer.codemaat

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.importer.codemaat.ParserDialog.Companion.myCollectParserArgs
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
    private val inputFileName = "${testResourceBaseFolder}coupling-codemaat.csv"
    private val outputFileName = "sampleOutputFile"

    @Test
    fun `should output correct arguments when valid input is provided`() {
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

            val cmdLine = CommandLine(CodeMaatImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
            assertThat(parseResult.matchedPositional(0).getValue<List<File>>()[0].name).isEqualTo(File(inputFileName).name)
        }
    }

    @Test
    fun `should output correct arguments when compress flag is set`() {
        val outputFileName = "cmi.cc.json"
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

            val cmdLine = CommandLine(CodeMaatImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
            assertThat(parseResult.matchedPositional(0).getValue<List<File>>()[0].name).isEqualTo(File(inputFileName).name)
        }
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        val invalidFileName = ""
        val outputFileName = "cmi.cc.json"

        testSession { terminal ->
            val parserArguments = myCollectParserArgs(
                fileCallback = {
                    terminal.type(invalidFileName)
                    terminal.press(Keys.ENTER)
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

            val cmdLine = CommandLine(CodeMaatImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositional(0).getValue<List<File>>()[0].name).isEqualTo(File(inputFileName).name)
        }
    }
}
