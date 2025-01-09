package de.maibornwolff.codecharta.filter.mergefilter

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.filter.mergefilter.ParserDialog.Companion.myCollectParserArgs
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Timeout
import picocli.CommandLine
import java.io.File
import kotlin.io.path.Path

@Timeout(120)
class ParserDialogTest {
    val testResourceBaseFolder = "src/test/resources/"
    val inputFolderName = testResourceBaseFolder
    val inputFolderPath = Path(inputFolderName)

    @Test
    fun `should output correct arguments and skip questions (leaf, no mimo or large)`() {
        // given
        val outputFileName = "sampleOutputFile"
        val compress = false
        val addMissing = true
        val ignoreCase = false

        // set indirectly
        val recursive = false
        val leaf = true

        testSession { terminal ->
            val parserArguments = myCollectParserArgs(
                fileCallback = {
                    terminal.type(inputFolderName)
                    terminal.press(Keys.ENTER)
                },
                choiceCallback = { terminal.press(Keys.ENTER) },
                outFileCallback = {
                    terminal.type(outputFileName)
                    terminal.press(Keys.ENTER)
                },
                compressCallback = {
                    terminal.press(Keys.RIGHT)
                    terminal.press(Keys.ENTER)
                },
                strategyCallback = {
                    terminal.press(Keys.DOWN)
                    terminal.press(Keys.ENTER)
                },
                addMissingCallback = {
                    terminal.press(Keys.ENTER)
                },
                ignoreCaseCallback = {
                    terminal.press(Keys.RIGHT)
                    terminal.press(Keys.ENTER)
                }
            )

            val commandLine = CommandLine(MergeFilter())
            val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())
            assertThat(parseResult.matchedPositional(0).getValue<Array<File>>()[0].path).isEqualTo(inputFolderPath.toString())
            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(compress)
            assertThat(parseResult.matchedOption("add-missing").getValue<Boolean>()).isEqualTo(addMissing)
            assertThat(parseResult.matchedOption("recursive").getValue<Boolean>()).isEqualTo(recursive)
            assertThat(parseResult.matchedOption("leaf").getValue<Boolean>()).isEqualTo(leaf)
            assertThat(parseResult.matchedOption("ignore-case").getValue<Boolean>()).isEqualTo(ignoreCase)
            assertThat(parseResult.matchedOption("mimo")).isNull()
            assertThat(parseResult.matchedOption("large")).isNull()
            assertThat(parseResult.matchedOption("levenshtein-distance")).isNull()
        }
    }

    @Test
    fun `should output correct arguments and skip questions (recursive, no mimo or large)`() {
        // given
        val outputFileName = "sampleOutputFile"
        val compress = true
        val addMissing = false
        val ignoreCase = false

        // set indirectly
        val recursive = true
        val leaf = false

        testSession { terminal ->
            val parserArguments = myCollectParserArgs(
                fileCallback = {
                    terminal.type(inputFolderName)
                    terminal.press(Keys.ENTER)
                },
                choiceCallback = { terminal.press(Keys.ENTER) },
                outFileCallback = {
                    terminal.type(outputFileName)
                    terminal.press(Keys.ENTER)
                },
                compressCallback = {
                    terminal.press(Keys.ENTER)
                },
                strategyCallback = {
                    terminal.press(Keys.ENTER)
                },
                ignoreCaseCallback = {
                    terminal.press(Keys.RIGHT)
                    terminal.press(Keys.ENTER)
                }
            )

            val commandLine = CommandLine(MergeFilter())
            val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())
            assertThat(parseResult.matchedPositional(0).getValue<Array<File>>()[0].path).isEqualTo(inputFolderPath.toString())
            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(compress)
            assertThat(parseResult.matchedOption("add-missing").getValue<Boolean>()).isEqualTo(addMissing)
            assertThat(parseResult.matchedOption("recursive").getValue<Boolean>()).isEqualTo(recursive)
            assertThat(parseResult.matchedOption("leaf").getValue<Boolean>()).isEqualTo(leaf)
            assertThat(parseResult.matchedOption("ignore-case").getValue<Boolean>()).isEqualTo(ignoreCase)
            assertThat(parseResult.matchedOption("mimo")).isNull()
            assertThat(parseResult.matchedOption("large")).isNull()
            assertThat(parseResult.matchedOption("levenshtein-distance")).isNull()
        }
    }

    @Test
    fun `should output correct arguments when using Mimo Merge`() {
        // given
        val outputFolderName = "mimoOutputFolder"
        val addMissing = false
        val ignoreCase = true
        val levenshteinDistance = 3
        val compress = true

        // set indirectly
        val recursive = true
        val leaf = false

        testSession { terminal ->
            val parserArguments = myCollectParserArgs(
                fileCallback = {
                    terminal.type(inputFolderName)
                    terminal.press(Keys.ENTER)
                },
                choiceCallback = {
                    terminal.press(Keys.DOWN)
                    terminal.press(Keys.ENTER)
                },
                outFileCallback = {
                    terminal.type(outputFolderName)
                    terminal.press(Keys.ENTER)
                },
                compressCallback = {
                    terminal.press(Keys.ENTER)
                },
                levenshteinCallback = {
                    terminal.type(levenshteinDistance.toString())
                    terminal.press(Keys.ENTER)
                },
                strategyCallback = {
                    terminal.press(Keys.ENTER)
                },
                ignoreCaseCallback = {
                    terminal.press(Keys.ENTER)
                }
            )

            val commandLine = CommandLine(MergeFilter())
            val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())
            assertThat(parseResult.matchedPositional(0).getValue<Array<File>>()[0].path).isEqualTo(inputFolderPath.toString())
            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFolderName)
            assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(compress)
            assertThat(parseResult.matchedOption("add-missing").getValue<Boolean>()).isEqualTo(addMissing)
            assertThat(parseResult.matchedOption("recursive").getValue<Boolean>()).isEqualTo(recursive)
            assertThat(parseResult.matchedOption("leaf").getValue<Boolean>()).isEqualTo(leaf)
            assertThat(parseResult.matchedOption("ignore-case").getValue<Boolean>()).isEqualTo(ignoreCase)
            assertThat(parseResult.matchedOption("mimo").getValue<Boolean>()).isTrue()
            assertThat(parseResult.matchedOption("large")).isNull()
            assertThat(parseResult.matchedOption("levenshtein-distance").getValue<Int>()).isEqualTo(levenshteinDistance)
        }
    }

    @Test
    fun `should output correct arguments when using Large Merge`() {
        // given
        val outputFileName = "sampleOutputFile"
        val addMissing = false
        val ignoreCase = true
        val compress = true

        // set indirectly
        val recursive = true
        val leaf = false

        testSession { terminal ->
            val parserArguments = myCollectParserArgs(
                fileCallback = {
                    terminal.type(inputFolderName)
                    terminal.press(Keys.ENTER)
                },
                choiceCallback = {
                    terminal.press(Keys.DOWN)
                    terminal.press(Keys.DOWN)
                    terminal.press(Keys.ENTER)
                },
                outFileCallback = {
                    terminal.type(outputFileName)
                    terminal.press(Keys.ENTER)
                },
                compressCallback = {
                    terminal.press(Keys.ENTER)
                },
                strategyCallback = {
                    terminal.press(Keys.ENTER)
                },
                ignoreCaseCallback = {
                    terminal.press(Keys.ENTER)
                }
            )

            val commandLine = CommandLine(MergeFilter())
            val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())
            assertThat(parseResult.matchedPositional(0).getValue<Array<File>>()[0].path).isEqualTo(inputFolderPath.toString())
            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(compress)
            assertThat(parseResult.matchedOption("add-missing").getValue<Boolean>()).isEqualTo(addMissing)
            assertThat(parseResult.matchedOption("recursive").getValue<Boolean>()).isEqualTo(recursive)
            assertThat(parseResult.matchedOption("leaf").getValue<Boolean>()).isEqualTo(leaf)
            assertThat(parseResult.matchedOption("ignore-case").getValue<Boolean>()).isEqualTo(ignoreCase)
            assertThat(parseResult.matchedOption("large").getValue<Boolean>()).isTrue()
            assertThat(parseResult.matchedOption("mimo")).isNull()
            assertThat(parseResult.matchedOption("levenshtein-distance")).isNull()
        }
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        val invalidInputFolderName = ""
        val outputFileName = "sampleOutputFile"

        testSession { terminal ->
            val parserArguments = myCollectParserArgs(
                fileCallback = {
                    terminal.type(invalidInputFolderName)
                    terminal.press(Keys.ENTER)
                    terminal.type(inputFolderName)
                    terminal.press(Keys.ENTER)
                },
                choiceCallback = {
                    terminal.press(Keys.ENTER)
                },
                outFileCallback = {
                    terminal.type(outputFileName)
                    terminal.press(Keys.ENTER)
                },
                compressCallback = {
                    terminal.press(Keys.RIGHT)
                    terminal.press(Keys.ENTER)
                },
                strategyCallback = {
                    terminal.press(Keys.ENTER)
                },
                ignoreCaseCallback = {
                    terminal.press(Keys.ENTER)
                }
            )

            val commandLine = CommandLine(MergeFilter())
            val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())
            assertThat(parseResult.matchedPositional(0).getValue<Array<File>>()[0].path).isEqualTo(inputFolderPath.toString())
            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        }
    }
}
