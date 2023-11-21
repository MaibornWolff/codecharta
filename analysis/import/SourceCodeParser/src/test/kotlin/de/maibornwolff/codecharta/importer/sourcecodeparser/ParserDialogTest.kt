package de.maibornwolff.codecharta.importer.sourcecodeparser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import com.github.kinquirer.components.promptListObject
import com.github.kinquirer.core.Choice
import io.mockk.every
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
        val fileName = "in.java"
        val outputFormat = OutputFormat.JSON
        val outputFileName = "out.cc.json"
        val findIssues = true
        val defaultExcludes = true
        val isCompressed = false
        val isVerbose = true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any())
        } returns fileName andThen outputFileName andThen ""
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns findIssues andThen defaultExcludes andThen isCompressed andThen isVerbose
        mockkStatic("com.github.kinquirer.components.ListKt")
        every {
            KInquirer.promptListObject(any(), any<List<Choice<OutputFormat>>>(), any(), any(), any())
        } returns outputFormat

        val parserArguments = ParserDialog.collectParserArgs()

        val cmdLine = CommandLine(SourceCodeParserMain())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(fileName)
        Assertions.assertThat(parseResult.matchedOption("format").getValue<OutputFormat>()).isEqualTo(outputFormat)
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<File>().name)
                .isEqualTo(outputFileName)
        Assertions.assertThat(parseResult.matchedOption("exclude")).isNull()
        Assertions.assertThat(parseResult.matchedOption("no-issues")).isNull()
        Assertions.assertThat(parseResult.matchedOption("default-excludes").getValue<Boolean>()).isEqualTo(defaultExcludes)
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        Assertions.assertThat(parseResult.matchedOption("verbose").getValue<Boolean>()).isEqualTo(isVerbose)
    }

    @Test
    fun `should accept multiple exclude patterns`() {
        val fileName = "in.java"
        val outputFormat = OutputFormat.CSV
        val outputFileName = "out.csv"
        val excludes = arrayOf("ex1", "ex2")
        val findIssues = false
        val defaultExcludes = false
        val isCompressed = true
        val isVerbose = false

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any())
        } returns fileName andThen outputFileName andThen excludes[0] andThen excludes[1] andThen ""
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns findIssues andThen defaultExcludes andThen isCompressed andThen isVerbose
        mockkStatic("com.github.kinquirer.components.ListKt")
        every {
            KInquirer.promptListObject(any(), any<List<Choice<OutputFormat>>>(), any(), any(), any())
        } returns outputFormat

        val parserArguments = ParserDialog.collectParserArgs()

        val cmdLine = CommandLine(SourceCodeParserMain())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(fileName)
        Assertions.assertThat(parseResult.matchedOption("format").getValue<OutputFormat>()).isEqualTo(outputFormat)
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<File>().name)
                .isEqualTo(outputFileName)
        Assertions.assertThat(parseResult.matchedOption("exclude").getValue<Array<String>>()).containsExactly(*excludes)
        Assertions.assertThat(parseResult.matchedOption("no-issues").getValue<Boolean>()).isEqualTo(!findIssues)
        Assertions.assertThat(parseResult.matchedOption("default-excludes")).isNull()
        Assertions.assertThat(parseResult.matchedOption("not-compressed")).isNull()
        Assertions.assertThat(parseResult.matchedOption("verbose")).isNull()
    }
}
