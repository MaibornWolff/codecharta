package de.maibornwolff.codecharta.filter.mergefilter

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
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

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ParserDialogTest {
@AfterEach
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should output correct arguments when provided with valid input`() {
        // given
        val inputFolderName = "folder"
        val outputFileName = "sampleOutputFile"
        val compress = false
        val addMissing = false
        val recursive = false
        val leaf = false
        val ignoreCase = false

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
        } returns compress andThen addMissing andThen recursive andThen leaf andThen ignoreCase

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(MergeFilter())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(
                parseResult.matchedPositional(0).getValue<Array<File>>().map {
                    it.name
                },
                             ).isEqualTo(listOf(inputFolderName))
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(compress)
        Assertions.assertThat(parseResult.matchedOption("add-missing").getValue<Boolean>()).isEqualTo(addMissing)
        Assertions.assertThat(parseResult.matchedOption("recursive").getValue<Boolean>()).isEqualTo(recursive)
        Assertions.assertThat(parseResult.matchedOption("leaf").getValue<Boolean>()).isEqualTo(leaf)
        Assertions.assertThat(parseResult.matchedOption("ignore-case").getValue<Boolean>()).isEqualTo(ignoreCase)
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() { // given
        val invalidInputFolderName = ""
        val validInputFolderName = "folder"
        val outputFileName = "sampleOutputFile"
        val compress = false
        val addMissing = false
        val recursive = false
        val leaf = false
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
        } returns compress andThen addMissing andThen recursive andThen leaf andThen ignoreCase

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(MergeFilter())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(
                parseResult.matchedPositional(0).getValue<Array<File>>().map {
                    it.name
                },
                             ).isEqualTo(listOf(validInputFolderName))
    }
}
