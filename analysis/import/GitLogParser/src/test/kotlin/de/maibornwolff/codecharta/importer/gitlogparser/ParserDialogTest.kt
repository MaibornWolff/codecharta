package de.maibornwolff.codecharta.importer.gitlogparser

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
        val fileName = "git.log"
        val outputFileName = "codecharta.cc.json"
        val fileNameList = "file-name-list.txt"
        val isCompressed = false
        val isSilent = false
        val addAuthor = false

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns fileName andThen outputFileName andThen fileNameList
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed andThen isSilent andThen addAuthor

        val parserArguments = ParserDialog.collectParserArgs()

        val cmdLine = CommandLine(GitLogParser())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("file-name-list").getValue<File>().name).isEqualTo(fileNameList)
        assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        assertThat(parseResult.matchedOption("silent").getValue<Boolean>()).isEqualTo(isSilent)
        assertThat(parseResult.matchedOption("add-author").getValue<Boolean>()).isEqualTo(addAuthor)
        assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(fileName)
    }

    @Test
    fun `should output correct arguments compressed`() {
        val fileName = "git.log"
        val outputFileName = "codecharta.cc.json"
        val fileNameList = "file-name-list.txt"
        val isCompressed = true
        val isSilent = false
        val addAuthor = false

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns fileName andThen outputFileName andThen fileNameList
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed andThen isSilent andThen addAuthor

        val parserArguments = ParserDialog.collectParserArgs()

        val cmdLine = CommandLine(GitLogParser())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("file-name-list").getValue<File>().name).isEqualTo(fileNameList)
        assertNull(parseResult.matchedOption("not-compressed"))
        assertThat(parseResult.matchedOption("silent").getValue<Boolean>()).isEqualTo(isSilent)
        assertThat(parseResult.matchedOption("add-author").getValue<Boolean>()).isEqualTo(addAuthor)
        assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(fileName)
    }
}
