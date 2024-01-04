package de.maibornwolff.codecharta.exporter.csvexporter

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import com.github.kinquirer.components.promptInputNumber
import de.maibornwolff.codecharta.exporter.csv.CSVExporter
import de.maibornwolff.codecharta.exporter.csv.ParserDialog
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
import java.math.BigDecimal

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ParserDialogTest {

    @AfterAll
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should output correct arguments when provided with valid input`() {
        // given
        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns "sampleFile.cc.json" andThen "sampleOutputFile"
        every {
            KInquirer.promptInputNumber(any(), any(), any())
        } returns BigDecimal(5)

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(CSVExporter())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<Array<File>>().first().name).isEqualTo("sampleFile.cc.json")
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo("sampleOutputFile")
        Assertions.assertThat(parseResult.matchedOption("depth-of-hierarchy").getValue<Int>()).isEqualTo(5)
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        // given
        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns false andThen true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns "" andThen "sampleFile.cc.json" andThen "sampleOutputFile"
        every {
            KInquirer.promptInputNumber(any(), any(), any())
        } returns BigDecimal(5)

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(CSVExporter())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<Array<File>>().first().name).isEqualTo("sampleFile.cc.json")
    }
}
