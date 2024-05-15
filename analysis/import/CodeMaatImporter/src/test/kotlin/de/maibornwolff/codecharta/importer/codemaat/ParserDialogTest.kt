package de.maibornwolff.codecharta.importer.codemaat

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
import org.junit.jupiter.api.Assertions.assertNull
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
        val fileName =
            "cmi"
        val outputFileName =
            "cmi.cc.json"
        val isCompressed =
            false

        mockkObject(InputHelper)
        every {
            InputHelper.isInputValidAndNotNull(any(), any())
        } returns true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns fileName andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed

        // when
        val parserArguments =
            ParserDialog.collectParserArgs()
        val cmdLine =
            CommandLine(CodeMaatImporter())
        val parseResult =
            cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>().equals(outputFileName))
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<List<File>>()[0].name).isEqualTo(fileName)
    }

    @Test
    fun `should output correct arguments when compress flag is set`() {
        // given
        val fileName =
            "cmi"
        val outputFileName =
            "cmi.cc.json"
        val isCompressed =
            true

        mockkObject(InputHelper)
        every {
            InputHelper.isInputValidAndNotNull(any(), any())
        } returns true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns fileName andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed

        // when
        val parserArguments =
            ParserDialog.collectParserArgs()
        val cmdLine =
            CommandLine(CodeMaatImporter())
        val parseResult =
            cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>().equals(outputFileName))
        assertNull(parseResult.matchedOption("not-compressed"))
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<List<File>>()[0].name).isEqualTo(fileName)
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        // given
        val invalidFileName =
            ""
        val validFileName =
            "cmi"
        val outputFileName =
            "cmi.cc.json"
        val isCompressed =
            true

        mockkObject(InputHelper)
        every {
            InputHelper.isInputValidAndNotNull(any(), any())
        } returns false andThen true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns invalidFileName andThen validFileName andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed

        // when
        val parserArguments =
            ParserDialog.collectParserArgs()
        val cmdLine =
            CommandLine(CodeMaatImporter())
        val parseResult =
            cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<List<File>>()[0].name).isEqualTo(validFileName)
    }
}
