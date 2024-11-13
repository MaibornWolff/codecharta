package de.maibornwolff.codecharta.filter.mergefilter

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import com.github.kinquirer.components.promptInputNumber
import com.github.kinquirer.components.promptList
import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import picocli.CommandLine
import java.io.File
import java.math.BigDecimal

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ParserDialogTest {
    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should output correct arguments and skip questions (leaf, no mimo)`() {
        // given
        val inputFolderName = "folder"
        val outputFileName = "sampleOutputFile"
        val compress = false
        val addMissing = true
        val ignoreCase = false
        val mimo = false

        // set indirectly
        val recursive = false
        val leaf = true

        mockkObject(InputHelper)
        every {
            InputHelper.isInputValidAndNotNull(any(), any())
        } returns true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns inputFolderName andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns mimo andThen compress andThen addMissing andThen ignoreCase
        mockkStatic("com.github.kinquirer.components.ListKt")
        every {
            KInquirer.promptList(any(), any(), any(), any(), any())
        } returns "Leaf Merging Strategy"

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(MergeFilter())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(
            parseResult.matchedPositional(0).getValue<Array<File>>().map {
                it.name
            }
        ).isEqualTo(listOf(inputFolderName))
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(!compress)
        Assertions.assertThat(parseResult.matchedOption("add-missing").getValue<Boolean>()).isEqualTo(addMissing)
        Assertions.assertThat(parseResult.matchedOption("recursive").getValue<Boolean>()).isEqualTo(recursive)
        Assertions.assertThat(parseResult.matchedOption("leaf").getValue<Boolean>()).isEqualTo(leaf)
        Assertions.assertThat(parseResult.matchedOption("ignore-case").getValue<Boolean>()).isEqualTo(ignoreCase)
    }

    @Test
    fun `should output correct arguments and skip questions (recursive, no mimo)`() {
        // given
        val inputFolderName = "folder"
        val outputFileName = "sampleOutputFile"
        val compress = true
        val addMissing = false
        val ignoreCase = false
        val mimo = false

        // set indirectly
        val recursive = true
        val leaf = false

        mockkObject(InputHelper)
        every {
            InputHelper.isInputValidAndNotNull(any(), any())
        } returns true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns inputFolderName andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns mimo andThen compress andThen ignoreCase
        mockkStatic("com.github.kinquirer.components.ListKt")
        every {
            KInquirer.promptList(any(), any(), any(), any(), any())
        } returns "Recursive Merging Strategy"

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(MergeFilter())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(
            parseResult.matchedPositional(0).getValue<Array<File>>().map {
                it.name
            }
        ).isEqualTo(listOf(inputFolderName))
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(!compress)
        Assertions.assertThat(parseResult.matchedOption("add-missing").getValue<Boolean>()).isEqualTo(addMissing)
        Assertions.assertThat(parseResult.matchedOption("recursive").getValue<Boolean>()).isEqualTo(recursive)
        Assertions.assertThat(parseResult.matchedOption("leaf").getValue<Boolean>()).isEqualTo(leaf)
        Assertions.assertThat(parseResult.matchedOption("ignore-case").getValue<Boolean>()).isEqualTo(ignoreCase)
    }

    @Test
    fun `should output correct arguments when mimo`() {
        // given
        val inputFolderName = "folder"
        val addMissing = false
        val ignoreCase = true
        val mimo = true
        val levenshteinDistance = BigDecimal(3)
        val compress = true

        // set indirectly
        val recursive = true
        val leaf = false

        mockkObject(InputHelper)
        every {
            InputHelper.isInputValidAndNotNull(any(), any())
        } returns true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns inputFolderName
        every {
            KInquirer.promptInputNumber(any(), any(), any(), any())
        } returns levenshteinDistance

        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns mimo andThen compress andThen ignoreCase
        mockkStatic("com.github.kinquirer.components.ListKt")
        every {
            KInquirer.promptList(any(), any(), any(), any(), any())
        } returns "Recursive Merging Strategy"

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(MergeFilter())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(
            parseResult.matchedPositional(0).getValue<Array<File>>().map {
                it.name
            }
        ).isEqualTo(listOf(inputFolderName))
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(!compress)
        Assertions.assertThat(parseResult.matchedOption("add-missing").getValue<Boolean>()).isEqualTo(addMissing)
        Assertions.assertThat(parseResult.matchedOption("recursive").getValue<Boolean>()).isEqualTo(recursive)
        Assertions.assertThat(parseResult.matchedOption("leaf").getValue<Boolean>()).isEqualTo(leaf)
        Assertions.assertThat(parseResult.matchedOption("ignore-case").getValue<Boolean>()).isEqualTo(ignoreCase)
        Assertions.assertThat(parseResult.matchedOption("mimo").getValue<Boolean>()).isEqualTo(mimo)
        Assertions.assertThat(parseResult.matchedOption("levenshtein-distance").getValue<Int>()).isEqualTo(levenshteinDistance.toInt())
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() { // given
        val invalidInputFolderName = ""
        val validInputFolderName = "folder"
        val outputFileName = "sampleOutputFile"
        val compress = false
        val addMissing = false
        val ignoreCase = false

        mockkObject(InputHelper)
        every {
            InputHelper.isInputValidAndNotNull(any(), any())
        } returns false andThen true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns invalidInputFolderName andThen validInputFolderName andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns compress andThen addMissing andThen ignoreCase
        mockkStatic("com.github.kinquirer.components.ListKt")
        every {
            KInquirer.promptList(any(), any(), any(), any(), any())
        } returns "Leaf Merging Strategy"

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(MergeFilter())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(
            parseResult.matchedPositional(0).getValue<Array<File>>().map {
                it.name
            }
        ).isEqualTo(listOf(validInputFolderName))
    }
}
