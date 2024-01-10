package de.maibornwolff.codecharta.importer.svnlogparser

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
        val fileName = "svn.log"
        val outputFileName = "codecharta.cc.json"
        val isCompressed = false
        val isSilent = false
        val addAuthor = false

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns fileName andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed andThen isSilent andThen addAuthor

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val cmdLine = CommandLine(SVNLogParser())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        Assertions.assertThat(parseResult.matchedOption("silent").getValue<Boolean>()).isEqualTo(isSilent)
        Assertions.assertThat(parseResult.matchedOption("add-author").getValue<Boolean>()).isEqualTo(addAuthor)
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(fileName)
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        // given
        val invalidInputFileName = ""
        val validInputFileName = "svn.log"
        val outputFileName = "codecharta.cc.json"
        val isCompressed = false
        val isSilent = false
        val addAuthor = false

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns false andThen true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns invalidInputFileName andThen validInputFileName andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed andThen isSilent andThen addAuthor

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val cmdLine = CommandLine(SVNLogParser())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(validInputFileName)
    }
}
