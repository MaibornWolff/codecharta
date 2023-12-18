package de.maibornwolff.codecharta.filter.structuremodifier

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import com.github.kinquirer.components.promptInputNumber
import com.github.kinquirer.components.promptList
import io.mockk.every
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
    fun `should output correct arguments when print structure is selected`() {
        // given
        val inputFolderName = "sampleInputFile"
        val printLevels = BigDecimal(5)

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any(), any())
        } returns inputFolderName
        every {
            KInquirer.promptInputNumber(any(), any(), any(), any())
        } returns printLevels
        mockkStatic("com.github.kinquirer.components.ListKt")
        every {
            KInquirer.promptList(any(), any(), any(), any(), any())
        } returns StructureModifierAction.PRINT_STRUCTURE.descripton

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(StructureModifier())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(inputFolderName)
        Assertions.assertThat(parseResult.matchedOption("print-levels").getValue<Int>()).isEqualTo(5)
        Assertions.assertThat(parseResult.matchedOption("output-file")).isNull()
        Assertions.assertThat(parseResult.matchedOption("set-root")).isNull()
        Assertions.assertThat(parseResult.matchedOption("move-to")).isNull()
        Assertions.assertThat(parseResult.matchedOption("move-from")).isNull()
        Assertions.assertThat(parseResult.matchedOption("remove")).isNull()
    }

    @Test
    fun `should output correct arguments when extract path is selected`() {
        // given
        val inputFolderName = "sampleInputFile"
        val pathToBeExtracted = "/root/src/main"
        val outputFileName = "output"

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any(), any())
        } returns inputFolderName andThen pathToBeExtracted andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ListKt")
        every {
            KInquirer.promptList(any(), any(), any(), any(), any())
        } returns StructureModifierAction.SET_ROOT.descripton

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(StructureModifier())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(inputFolderName)
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        Assertions.assertThat(parseResult.matchedOption("set-root").getValue<String>()).isEqualTo(pathToBeExtracted)
        Assertions.assertThat(parseResult.matchedOption("print-levels")).isNull()
        Assertions.assertThat(parseResult.matchedOption("move-from")).isNull()
        Assertions.assertThat(parseResult.matchedOption("move-to")).isNull()
        Assertions.assertThat(parseResult.matchedOption("remove")).isNull()
    }

    @Test
    fun `should output correct arguments when move nodes is selected`() {
        // given
        val inputFolderName = "sampleInputFile"
        val outputFileName = "output"
        val moveFrom = "/root/src/main/java"
        val moveTo = "/root/src/main/java/subfolder"

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any(), any())
        } returns inputFolderName andThen moveFrom andThen moveTo andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ListKt")
        every {
            KInquirer.promptList(any(), any(), any(), any(), any())
        } returns StructureModifierAction.MOVE_NODES.descripton

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(StructureModifier())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(inputFolderName)
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        Assertions.assertThat(parseResult.matchedOption("move-from").getValue<String>()).isEqualTo(moveFrom)
        Assertions.assertThat(parseResult.matchedOption("move-to").getValue<String>()).isEqualTo(moveTo)
        Assertions.assertThat(parseResult.matchedOption("print-levels")).isNull()
        Assertions.assertThat(parseResult.matchedOption("set-root")).isNull()
        Assertions.assertThat(parseResult.matchedOption("remove")).isNull()
    }

    @Test
    fun `should output correct arguments when remove nodes is selected`() {
        // given
        val inputFolderName = "sampleInputFile"
        val outputFileName = "output"
        val nodeToRemove = "/root/src/main/java"
        val nodesToRemove = arrayOf(nodeToRemove)

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any(), any())
        } returns inputFolderName andThen nodeToRemove andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ListKt")
        every {
            KInquirer.promptList(any(), any(), any(), any(), any())
        } returns StructureModifierAction.REMOVE_NODES.descripton

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(StructureModifier())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(inputFolderName)
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        Assertions.assertThat(parseResult.matchedOption("remove").getValue<Array<String>>()).isEqualTo(nodesToRemove)
        Assertions.assertThat(parseResult.matchedOption("print-levels")).isNull()
        Assertions.assertThat(parseResult.matchedOption("move-from")).isNull()
        Assertions.assertThat(parseResult.matchedOption("set-root")).isNull()
        Assertions.assertThat(parseResult.matchedOption("move-to")).isNull()
    }
}
