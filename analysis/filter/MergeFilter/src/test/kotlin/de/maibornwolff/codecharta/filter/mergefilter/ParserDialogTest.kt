package de.maibornwolff.codecharta.filter.mergefilter

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.filter.mergefilter.ParserDialog.Companion.collectParserArgs
import io.mockk.every
import io.mockk.mockkObject
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Timeout
import picocli.CommandLine
import java.io.File
import kotlin.io.path.Path

@Timeout(120)
class ParserDialogTest {
    private val testResourceBaseFolder = "src/test/resources/"
    private val inputFolderName = testResourceBaseFolder
    private val inputFolderPath = Path(inputFolderName)

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

        mockkObject(ParserDialog.Companion)

        testSession { terminal ->
            every { ParserDialog.Companion.fileCallback() } returns {
                terminal.type(inputFolderName)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.choiceCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.outFileCallback() } returns {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.compressCallback() } returns {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.strategyCallback() } returns {
                terminal.press(Keys.DOWN)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.addMissingCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.ignoreCaseCallback() } returns {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            val parserArguments = collectParserArgs(this)

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

        mockkObject(ParserDialog.Companion)

        testSession { terminal ->
            every { ParserDialog.Companion.fileCallback() } returns {
                terminal.type(inputFolderName)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.choiceCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.outFileCallback() } returns {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.compressCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.strategyCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.ignoreCaseCallback() } returns {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            val parserArguments = collectParserArgs(this)

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

        mockkObject(ParserDialog.Companion)

        testSession { terminal ->
            every { ParserDialog.Companion.fileCallback() } returns {
                terminal.type(inputFolderName)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.choiceCallback() } returns {
                terminal.press(Keys.DOWN)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.outFileCallback() } returns {
                terminal.type(outputFolderName)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.compressCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.levenshteinCallback() } returns {
                terminal.type(levenshteinDistance.toString())
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.strategyCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.ignoreCaseCallback() } returns {
                terminal.press(Keys.ENTER)
            }

            val parserArguments = collectParserArgs(this)

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

        mockkObject(ParserDialog.Companion)

        testSession { terminal ->
            every { ParserDialog.Companion.fileCallback() } returns {
                terminal.type(inputFolderName)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.choiceCallback() } returns {
                terminal.press(Keys.DOWN)
                terminal.press(Keys.DOWN)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.outFileCallback() } returns {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.compressCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.strategyCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.ignoreCaseCallback() } returns {
                terminal.press(Keys.ENTER)
            }

            val parserArguments = collectParserArgs(this)

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

        mockkObject(ParserDialog.Companion)

        testSession { terminal ->
            every { ParserDialog.Companion.fileCallback() } returns {
                terminal.type(invalidInputFolderName)
                terminal.press(Keys.ENTER)
                terminal.type(inputFolderName)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.choiceCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.outFileCallback() } returns {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.compressCallback() } returns {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.strategyCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.ignoreCaseCallback() } returns {
                terminal.press(Keys.ENTER)
            }

            val parserArguments = collectParserArgs(this)

            val commandLine = CommandLine(MergeFilter())
            val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())
            assertThat(parseResult.matchedPositional(0).getValue<Array<File>>()[0].path).isEqualTo(inputFolderPath.toString())
            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        }
    }
}
