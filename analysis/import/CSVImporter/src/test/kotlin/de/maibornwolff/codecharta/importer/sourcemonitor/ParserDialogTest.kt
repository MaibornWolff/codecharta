package de.maibornwolff.codecharta.importer.sourcemonitor

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import picocli.CommandLine
import java.io.File

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ParserDialogTest {

    @AfterAll
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should output correct arguments`() {
        // given
        val fileName = "in.csv"
        val outputFileName = "out.cc.json"
        val isCompressed = true

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any())
        } returns fileName andThen "" andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val cmdLine = CommandLine(SourceMonitorImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        Assertions.assertThat(parseResult.matchedOption("not-compressed")).isNull()
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[0].name).isEqualTo(fileName)
    }

    @Test
    fun `should output correct arguments not compressed`() {
        // given
        val fileName = "in.csv"
        val outputFileName = "out.cc.json"
        val isCompressed = false

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any())
        } returns fileName andThen "" andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val cmdLine = CommandLine(SourceMonitorImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[0].name).isEqualTo(fileName)
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        // given
        val validFileName1 = "in1.csv"
        val validFileName2 = "in2.csv"
        val invalidFileName1 = "invalidFileName1"
        val invalidFileName2 = "invalidFileName2"
        val outputFileName = "out.cc.json"
        val isCompressed = false

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns false andThen true andThen false andThen true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any())
        } returns invalidFileName1 andThen validFileName1 andThen invalidFileName2 andThen validFileName2 andThen "" andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val cmdLine = CommandLine(SourceMonitorImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[0].name).isEqualTo(validFileName1)
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[1].name).isEqualTo(validFileName2)
    }
}
