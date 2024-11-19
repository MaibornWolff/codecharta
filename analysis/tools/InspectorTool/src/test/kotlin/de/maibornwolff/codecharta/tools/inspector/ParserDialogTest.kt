package de.maibornwolff.codecharta.tools.inspector

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import com.github.kinquirer.components.promptInputNumber
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
    fun `should output correct arguments when print structure is selected`() {
        // given
        val inputFolderName = "sampleInputFile"
        val printLevels = BigDecimal(5)

        mockkObject(InputHelper)
        every {
            InputHelper.isInputValidAndNotNull(any(), any())
        } returns true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any(), any())
        } returns inputFolderName
        every {
            KInquirer.promptInputNumber(any(), any(), any(), any())
        } returns printLevels
        mockkStatic("com.github.kinquirer.components.ListKt")

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(InspectorTool())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(inputFolderName)
        Assertions.assertThat(parseResult.matchedOption("levels").getValue<Int>()).isEqualTo(5)
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        // given
        val invalidInputFolderName = ""
        val validInputFolderName = "sampleInputFile"
        val printLevels = BigDecimal(5)

        mockkObject(InputHelper)
        every {
            InputHelper.isInputValidAndNotNull(any(), any())
        } returns false andThen true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any(), any())
        } returns invalidInputFolderName andThen validInputFolderName
        every {
            KInquirer.promptInputNumber(any(), any(), any(), any())
        } returns printLevels
        mockkStatic("com.github.kinquirer.components.ListKt")

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(InspectorTool())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(validInputFolderName)
    }
}
