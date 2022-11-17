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
        val printLevels = BigDecimal(25)
        val setRoot = "myRoot"
        val moveTo = "myMoveTo"
        val moveFrom = "myMoveFrom"
        val remove = "myRemove"

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns inputFolderName andThen outputFileName andThen setRoot andThen moveFrom andThen moveTo andThen remove
        every {
            KInquirer.promptInputNumber(any(), any(), any())
        } returns printLevels

        val parserArguments = ParserDialog.collectParserArgs()
        println(parserArguments.toString())

        val commandLine = CommandLine(StructureModifier())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())
        println(parseResult.toString())
        assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(inputFolderName)
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("print-levels").getValue<Int>()).isEqualTo(printLevels.toInt())
        assertThat(parseResult.matchedOption("set-root").getValue<String>()).isEqualTo(setRoot)
        assertThat(parseResult.matchedOption("move-to").getValue<String>()).isEqualTo(moveTo)
        assertThat(parseResult.matchedOption("move-from").getValue<String>()).isEqualTo(moveFrom)
        assertThat(parseResult.matchedOption("remove").getValue<Array<String>>()).isEqualTo(arrayOf(remove))
    }

    @Test
    fun `should output correct arguments if all actions are empty`() {
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
        } returns inputFolderName andThen outputFileName andThen setRoot andThen moveFrom andThen remove
        every {
            KInquirer.promptInputNumber(any(), any(), any())
        } returns printLevels

        val parserArguments = ParserDialog.collectParserArgs()
        println(parserArguments.toString())

        val commandLine = CommandLine(StructureModifier())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())
        println(parseResult.toString())
        assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(inputFolderName)
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("print-levels")).isNull()
        assertThat(parseResult.matchedOption("set-root")).isNull()
        assertThat(parseResult.matchedOption("move-to")).isNull()
        assertThat(parseResult.matchedOption("move-from")).isNull()
        assertThat(parseResult.matchedOption("remove")).isNull()
    }

    @Test
    fun `should output correct arguments if moveTo and moveFrom is set`() {
        val inputFolderName = "sampleInputFile"
        val outputFileName = "sampleOutputFile"
        val printLevels = BigDecimal(0)
        val setRoot = ""
        val moveTo = "myMoveTo"
        val moveFrom = "myMoveFrom"
        val remove = ""

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns inputFolderName andThen outputFileName andThen setRoot andThen moveFrom andThen moveTo andThen remove
        every {
            KInquirer.promptInputNumber(any(), any(), any())
        } returns printLevels

        val parserArguments = ParserDialog.collectParserArgs()
        println(parserArguments.toString())

        val commandLine = CommandLine(StructureModifier())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())
        println(parseResult.toString())
        assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(inputFolderName)
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("print-levels")).isNull()
        assertThat(parseResult.matchedOption("set-root")).isNull()
        assertThat(parseResult.matchedOption("move-to").getValue<String>()).isEqualTo(moveTo)
        assertThat(parseResult.matchedOption("move-from").getValue<String>()).isEqualTo(moveFrom)
        assertThat(parseResult.matchedOption("remove")).isNull()
    }
}
