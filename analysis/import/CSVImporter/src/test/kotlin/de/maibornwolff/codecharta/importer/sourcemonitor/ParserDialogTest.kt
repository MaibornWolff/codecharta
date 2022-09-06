package de.maibornwolff.codecharta.importer.sourcemonitor

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
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
        val fileName = "in.csv"
        val outputFileName = "out.cc.json"
        val isCompressed = true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any())
        } returns fileName andThen "" andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed

        val parserArguments = ParserDialog.collectParserArgs()

        val cmdLine = CommandLine(SourceMonitorImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>().equals(outputFileName))
        Assertions.assertThat(parseResult.matchedOption("not-compressed")).isNull()
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[0].name).isEqualTo(fileName)
    }

    fun `should output correct arguments not compressed`() {
        val fileName = "in.csv"
        val outputFileName = "out.cc.json"
        val isCompressed = false

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any())
        } returns fileName andThen "" andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed

        val parserArguments = ParserDialog.collectParserArgs()

        val cmdLine = CommandLine(SourceMonitorImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>().equals(outputFileName))
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>().equals(isCompressed))
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[0].name).isEqualTo(fileName)
    }
}
