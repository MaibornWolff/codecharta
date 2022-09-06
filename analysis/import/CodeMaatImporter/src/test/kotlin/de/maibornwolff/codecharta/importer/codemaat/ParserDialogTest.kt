package de.maibornwolff.codecharta.importer.codemaat

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import io.mockk.every
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.Assertions.assertNull
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
        val fileName = "cmi"
        val outputFileName = "cmi.cc.json"
        val isCompressed = false

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns fileName andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed

        val parserArguments = ParserDialog.collectParserArgs()

        val cmdLine = CommandLine(CodeMaatImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>().equals(outputFileName))
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<List<File>>()[0].name).isEqualTo(fileName)
    }

    @Test
    fun `should output correct arguments compressed`() {
        val fileName = "cmi"
        val outputFileName = "cmi.cc.json"
        val isCompressed = true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns fileName andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed

        val parserArguments = ParserDialog.collectParserArgs()

        val cmdLine = CommandLine(CodeMaatImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>().equals(outputFileName))
        assertNull(parseResult.matchedOption("not-compressed"))
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<List<File>>()[0].name).isEqualTo(fileName)
    }
}
