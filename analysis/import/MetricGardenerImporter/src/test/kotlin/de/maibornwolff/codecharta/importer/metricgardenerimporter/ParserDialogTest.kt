package de.maibornwolff.codecharta.importer.metricgardenerimporter

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
    fun `should output correct arguments when compress-flag is not set`() {
        // given
        val fileName = "metricGardenIn.json"
        val outputFileName = "out.cc.json"
        val isCompressed = false
        val isJsonFile = true

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any())
        } returns fileName andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isJsonFile andThen isCompressed

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val cmdLine = CommandLine(MetricGardenerImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(fileName)
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>().equals(outputFileName))
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        Assertions.assertThat(parseResult.matchedOption("is-json-file").getValue<Boolean>()).isEqualTo(isJsonFile)
    }

    @Test
    fun `should output correct arguments when compress-flag is set`() {
        // given
        val fileName = "metricGardenIn.json"
        val outputFileName = "out.cc.json"
        val isCompressed = true
        val isJsonFile = false

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any())
        } returns fileName andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isJsonFile andThen isCompressed

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val cmdLine = CommandLine(MetricGardenerImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(fileName)
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>().equals(outputFileName))
        Assertions.assertThat(parseResult.matchedOption("not-compressed")).isNull()
        Assertions.assertThat(parseResult.matchedOption("is-json-file")).isNull()
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        // given
        val invalidFileName = "invalidFileName"
        val validFileName = "metricGardenIn.json"
        val outputFileName = "out.cc.json"
        val isCompressed = true
        val isJsonFile = false

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns false andThen true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any())
        } returns invalidFileName andThen validFileName andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isJsonFile andThen isCompressed

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val cmdLine = CommandLine(MetricGardenerImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(validFileName)
    }
}
