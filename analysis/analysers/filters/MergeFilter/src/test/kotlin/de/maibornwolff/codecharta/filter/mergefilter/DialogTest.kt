package de.maibornwolff.codecharta.analysers.filters.mergefilter

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.analysers.filters.mergefilter.Dialog.Companion.collectAnalyserArgs
import de.maibornwolff.codecharta.analysers.filters.mergefilter.Dialog.Companion.testCallback
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Timeout
import picocli.CommandLine
import java.io.File
import kotlin.io.path.Path

@Timeout(120)
class DialogTest {
    private val testResourceBaseFolder = "src/test/resources/"
    private val inputFolderName = testResourceBaseFolder
    private val inputFolderPath = Path(inputFolderName)

    @BeforeEach
    fun setup() {
        mockkObject(Dialog.Companion)
    }

    @AfterEach
    fun cleanup() {
        unmockkAll()
    }

    @Test
    fun `should output correct arguments and skip questions (leaf, no mimo or large)`() {
        val outputFileName = "sampleOutputFile"
        val compress = false
        val addMissing = true
        val ignoreCase = false
        val recursive = false
        val leaf = true

        var parserArguments: List<String> = listOf()

        testSession { terminal ->
            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(inputFolderName)
                terminal.press(Keys.ENTER)
            }
            val choiceCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            val strategyCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.DOWN)
                terminal.press(Keys.ENTER)
            }
            val addMissingCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val ignoreCaseCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                choiceCallback,
                outFileCallback,
                compressCallback,
                strategyCallback,
                addMissingCallback,
                ignoreCaseCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

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

    @Test
    fun `should output correct arguments and skip questions with multiple files (leaf, no mimo or large)`() {
        val outputFileName = "sampleOutputFile"
        val compress = false
        val addMissing = true
        val ignoreCase = false
        val recursive = false
        val leaf = true

        var parserArguments: List<String> = listOf()

        testSession { terminal ->
            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(inputFolderName)
                terminal.press(Keys.ENTER)
            }
            val choiceCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            val strategyCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.DOWN)
                terminal.press(Keys.ENTER)
            }
            val addMissingCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val ignoreCaseCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                choiceCallback,
                outFileCallback,
                compressCallback,
                strategyCallback,
                addMissingCallback,
                ignoreCaseCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

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

    @Test
    fun `should output correct arguments and skip questions (recursive, no mimo or large)`() {
        val outputFileName = "sampleOutputFile"
        val compress = true
        val addMissing = false
        val ignoreCase = false
        val recursive = true
        val leaf = false

        var parserArguments: List<String> = listOf()

        testSession { terminal ->
            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(inputFolderName)
                terminal.type(", ")
                terminal.type(inputFolderName)
                terminal.press(Keys.ENTER)
            }
            val choiceCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val strategyCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val ignoreCaseCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                choiceCallback,
                outFileCallback,
                compressCallback,
                strategyCallback,
                ignoreCaseCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

        val commandLine = CommandLine(MergeFilter())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedPositional(0).getValue<Array<File>>()[0].path).isEqualTo(inputFolderPath.toString())
        assertThat(parseResult.matchedPositional(0).getValue<Array<File>>()[1].path).isEqualTo(inputFolderPath.toString())
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

    @Test
    fun `should output correct arguments when using Mimo Merge`() {
        val outputFolderName = "mimoOutputFolder"
        val addMissing = false
        val ignoreCase = true
        val levenshteinDistance = 3
        val compress = true
        val recursive = true
        val leaf = false

        var parserArguments: List<String> = listOf()

        testSession { terminal ->
            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(inputFolderName)
                terminal.press(Keys.ENTER)
            }
            val choiceCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.DOWN)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFolderName)
                terminal.press(Keys.ENTER)
            }
            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val levenshteinCallback: suspend RunScope.() -> Unit = {
                terminal.type(levenshteinDistance.toString())
                terminal.press(Keys.ENTER)
            }
            val strategyCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val ignoreCaseCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                choiceCallback,
                outFileCallback,
                compressCallback,
                levenshteinCallback,
                strategyCallback,
                ignoreCaseCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

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

    @Test
    fun `should output correct arguments when using Large Merge`() {
        val outputFileName = "sampleOutputFile"
        val addMissing = false
        val ignoreCase = true
        val compress = true
        val recursive = true
        val leaf = false

        var parserArguments: List<String> = listOf()

        testSession { terminal ->
            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(inputFolderName)
                terminal.press(Keys.ENTER)
            }
            val choiceCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.DOWN)
                terminal.press(Keys.DOWN)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val strategyCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val ignoreCaseCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                choiceCallback,
                outFileCallback,
                compressCallback,
                strategyCallback,
                ignoreCaseCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

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

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        val invalidInputFolderName = ""
        val outputFileName = "sampleOutputFile"

        var parserArguments: List<String> = listOf()

        testSession { terminal ->
            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(invalidInputFolderName)
                terminal.press(Keys.ENTER)
                terminal.type(inputFolderName)
                terminal.press(Keys.ENTER)
            }
            val choiceCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            val strategyCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val ignoreCaseCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                choiceCallback,
                outFileCallback,
                compressCallback,
                strategyCallback,
                ignoreCaseCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

        val commandLine = CommandLine(MergeFilter())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedPositional(0).getValue<Array<File>>()[0].path).isEqualTo(inputFolderPath.toString())
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
    }

    @Test
    fun `should prompt for force merge`() {
        var result = false

        testSession { terminal ->
            every { testCallback() } returns {
                terminal.press(Keys.ENTER)
            }

            result = Dialog.askForceMerge(this)
        }

        assertThat(result).isTrue()
    }

    @Test
    fun `should prompt for Mimo prefix`() {
        val prefixOptions = setOf("prefix1", "prefix2")
        var result = ""

        testSession { terminal ->
            every { testCallback() } returns {
                terminal.press(Keys.DOWN)
                terminal.press(Keys.ENTER)
            }

            result = Dialog.askForMimoPrefix(this, prefixOptions)
        }

        assertThat(result).isEqualTo("prefix2")
    }

    @Test
    fun `should prompt for Mimo file selection`() {
        val files = listOf(File("file1"), File("file2"))

        var result = emptyList<File>()

        testSession { terminal ->
            every { testCallback() } returns {
                terminal.press(Keys.DOWN)
                terminal.press(Keys.SPACE)
                terminal.press(Keys.ENTER)
            }

            result = Dialog.requestMimoFileSelection(this, files)
        }

        assertThat(result).containsExactly(File("file2"))
    }
}
