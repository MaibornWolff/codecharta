package de.maibornwolff.codecharta.importer.tokeiimporter

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
    fun `should output correct arguments when valid input is provided`() {
        // given
        val fileName = "in.json"
        val outputFileName = "out.cc.json"
        val rootFolder = "/foo/bar"
        val pathSeparator = "/"
        val isCompressed = false

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any())
        } returns fileName andThen outputFileName andThen rootFolder andThen pathSeparator
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val cmdLine = CommandLine(TokeiImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(fileName)
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>().equals(outputFileName))
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        Assertions.assertThat(parseResult.matchedOption("root-name").getValue<String>()).isEqualTo(rootFolder)
        Assertions.assertThat(parseResult.matchedOption("path-separator").getValue<String>()).isEqualTo(pathSeparator)
    }

    @Test
    fun `should escape a single backslash`() {
        // given
        val fileName = "in.json"
        val outputFileName = "out.cc.json"
        val rootFolder = "/foo/bar"
        val pathSeparator = "\\"
        val pathSeparatorEscaped = "\\\\"
        val isCompressed = false

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any())
        } returns fileName andThen outputFileName andThen rootFolder andThen pathSeparator
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val cmdLine = CommandLine(TokeiImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(fileName)
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>().equals(outputFileName))
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        Assertions.assertThat(parseResult.matchedOption("root-name").getValue<String>()).isEqualTo(rootFolder)
        Assertions.assertThat(parseResult.matchedOption("path-separator").getValue<String>()).isEqualTo(pathSeparatorEscaped)
    }

    @Test
    fun `should not escape a double backslash`() {
        // given
        val fileName = "in.json"
        val outputFileName = "out.cc.json"
        val rootFolder = "/foo/bar"
        val pathSeparator = "\\\\"
        val isCompressed = false

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any())
        } returns fileName andThen outputFileName andThen rootFolder andThen pathSeparator
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val cmdLine = CommandLine(TokeiImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(fileName)
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>().equals(outputFileName))
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        Assertions.assertThat(parseResult.matchedOption("root-name").getValue<String>()).isEqualTo(rootFolder)
        Assertions.assertThat(parseResult.matchedOption("path-separator").getValue<String>()).isEqualTo(pathSeparator)
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        // given
        val invalidInputFileName = ""
        val validInputFileName = "in.json"
        val outputFileName = "out.cc.json"
        val rootFolder = "/foo/bar"
        val pathSeparator = "/"
        val isCompressed = false

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns false andThen true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any())
        } returns invalidInputFileName andThen validInputFileName andThen outputFileName andThen rootFolder andThen pathSeparator
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val cmdLine = CommandLine(TokeiImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(validInputFileName)
    }
}
