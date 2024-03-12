package de.maibornwolff.codecharta.importer.csv

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
        val fileName = "in.csv"
        val outputFileName = "out.cc.json"
        val pathColumnName = "path"
        val delimiter = ";"
        val pathSeparator = "/"
        val isCompressed = false

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any())
        } returns fileName andThen "" andThen outputFileName andThen pathColumnName andThen delimiter andThen pathSeparator
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val cmdLine = CommandLine(CSVImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        Assertions.assertThat(parseResult.matchedOption("path-column-name").getValue<String>()).isEqualTo(pathColumnName)
        Assertions.assertThat(parseResult.matchedOption("delimiter").getValue<Char>()).isEqualTo(delimiter[0])
        Assertions.assertThat(parseResult.matchedOption("path-separator").getValue<Char>()).isEqualTo(pathSeparator[0])
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[0].name).isEqualTo(fileName)
    }

    @Test
    fun `should output correct arguments when multiple files are provided`() {
        // given
        val fileName = "in.csv"
        val fileName2 = "in2.csv"
        val fileName3 = "in3.csv"
        val outputFileName = "out.cc.json"
        val pathColumnName = "path"
        val delimiter = ";"
        val pathSeparator = "/"
        val isCompressed = true

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns true andThen true andThen true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any(), any())
        } returns fileName andThen fileName2 andThen fileName3 andThen "" andThen outputFileName andThen pathColumnName andThen delimiter andThen pathSeparator
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val cmdLine = CommandLine(CSVImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        Assertions.assertThat(parseResult.matchedOption("path-column-name").getValue<String>()).isEqualTo(pathColumnName)
        Assertions.assertThat(parseResult.matchedOption("delimiter").getValue<Char>()).isEqualTo(delimiter[0])
        Assertions.assertThat(parseResult.matchedOption("path-separator").getValue<Char>()).isEqualTo(pathSeparator[0])
        Assertions.assertThat(parseResult.matchedOption("not-compressed")).isNull()
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[0].name).isEqualTo(fileName)
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[1].name).isEqualTo(fileName2)
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[2].name).isEqualTo(fileName3)
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        // given
        val invalidFileName1 = "invalidFileName"
        val invalidFileName2 = "invalidFileName2"
        val validFileName1 = "in.csv"
        val validFileName2 = "in2.csv"
        val validFileName3 = "in3.csv"
        val outputFileName = "out.cc.json"
        val pathColumnName = "path"
        val delimiter = ";"
        val pathSeparator = "/"
        val isCompressed = true

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns false andThen true andThen false andThen true andThen true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any(), any())
        } returns invalidFileName1 andThen validFileName1 andThen invalidFileName2 andThen validFileName2 andThen validFileName3 andThen "" andThen outputFileName andThen pathColumnName andThen delimiter andThen pathSeparator
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val cmdLine = CommandLine(CSVImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[0].name).isEqualTo(validFileName1)
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[1].name).isEqualTo(validFileName2)
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[2].name).isEqualTo(validFileName3)
    }
}
