package de.maibornwolff.codecharta.importer.csv

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import io.mockk.every
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
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
        val fileName = "in.csv"
        val outputFileName = "out.cc.json"
        val pathColumnName = "path"
        val delimiter = ";"
        val pathSeparator = "/"
        val isCompressed = false

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any())
        } returns fileName andThen "" andThen outputFileName andThen pathColumnName andThen delimiter andThen pathSeparator
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed

        val parserArguments = ParserDialog.collectParserArgs()

        val cmdLine = CommandLine(CSVImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("path-column-name").getValue<String>()).isEqualTo(pathColumnName)
        assertThat(parseResult.matchedOption("delimiter").getValue<Char>()).isEqualTo(delimiter[0])
        assertThat(parseResult.matchedOption("path-separator").getValue<Char>()).isEqualTo(pathSeparator[0])
        assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[0].name).isEqualTo(fileName)
    }

    @Test
    fun `should accept multiple file names`() {
        val fileName = "in.csv"
        val fileName2 = "in2.csv"
        val fileName3 = "in3.csv"
        val outputFileName = "out.cc.json"
        val pathColumnName = "path"
        val delimiter = ";"
        val pathSeparator = "/"
        val isCompressed = true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any(), any())
        } returns fileName andThen fileName2 andThen fileName3 andThen "" andThen outputFileName andThen pathColumnName andThen delimiter andThen pathSeparator
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed

        val parserArguments = ParserDialog.collectParserArgs()

        val cmdLine = CommandLine(CSVImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("path-column-name").getValue<String>()).isEqualTo(pathColumnName)
        assertThat(parseResult.matchedOption("delimiter").getValue<Char>()).isEqualTo(delimiter[0])
        assertThat(parseResult.matchedOption("path-separator").getValue<Char>()).isEqualTo(pathSeparator[0])
        assertNull(parseResult.matchedOption("not-compressed"))
        assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[0].name).isEqualTo(fileName)
        assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[1].name).isEqualTo(fileName2)
        assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[2].name).isEqualTo(fileName3)
    }
}
