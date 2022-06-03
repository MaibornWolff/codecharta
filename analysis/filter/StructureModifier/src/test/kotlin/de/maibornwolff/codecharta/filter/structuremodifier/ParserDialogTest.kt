package de.maibornwolff.codecharta.filter.structuremodifier

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import com.github.kinquirer.components.promptInputNumber
import io.mockk.every
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
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
    fun `should output correct arguments`() {
        val inputFolderName = "sampleInputFile"
        val outputFileName = "sampleOutputFile"
        val printLevels = BigDecimal(0)
        val setRoot = ""
        val moveTo = ""
        val moveFrom = ""
        val remove = ""

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns inputFolderName andThen outputFileName andThen moveTo andThen moveFrom andThen remove andThen setRoot
        every {
            KInquirer.promptInputNumber(any(), any(), any())
        } returns printLevels

        val parserArguments = ParserDialog.collectParserArgs()
        println(parserArguments.toString())

        val commandLine = CommandLine(StructureModifier())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())
        println(parseResult.toString())
        assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(inputFolderName)
        assertThat(parseResult.matchedOption("output-file").getValue<File>().name).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("print-levels").getValue<Int>()).isEqualTo(printLevels.toInt())
        assertThat(parseResult.matchedOption("set-root").getValue<String>()).isEqualTo(setRoot)
        assertThat(parseResult.matchedOption("move-to").getValue<String>()).isEqualTo(moveTo)
        assertThat(parseResult.matchedOption("move-from").getValue<String>()).isEqualTo(moveFrom)
        assertThat(parseResult.matchedOption("remove").getValue<Array<String>>()).isEqualTo(arrayOf(remove))
    }
}
