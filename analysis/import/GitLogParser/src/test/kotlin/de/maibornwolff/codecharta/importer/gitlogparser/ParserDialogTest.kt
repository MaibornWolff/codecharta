package de.maibornwolff.codecharta.importer.gitlogparser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.importer.gitlogparser.subcommands.LogScanCommand
import de.maibornwolff.codecharta.importer.gitlogparser.subcommands.RepoScanCommand
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

    private val FIRST_ELEMENT = 1

    @AfterAll
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should output correct arguments for repo-scan`() {
        val isLogScan = false
        val pathName = "path/to/repo"
        val outputFileName = "codecharta.cc.json"
        val isCompressed = false
        val isSilent = false
        val addAuthor = false

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns pathName andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isLogScan andThen isCompressed andThen isSilent andThen addAuthor

        val parserArguments = ParserDialog.collectParserArgs().drop(FIRST_ELEMENT)

        val cmdLine = CommandLine(RepoScanCommand())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())
        assertThat(parseResult.originalArgs()[0].equals("repo-scan"))
        assertThat(parseResult.matchedOption("repo-path").getValue<String>()).isEqualTo(pathName)
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        assertThat(parseResult.matchedOption("silent").getValue<Boolean>()).isEqualTo(isSilent)
        assertThat(parseResult.matchedOption("add-author").getValue<Boolean>()).isEqualTo(addAuthor)
    }

    @Test
    fun `should output correct arguments for repo-scan compressed`() {
        val isLogScan = false
        val pathName = "path/to/repo"
        val outputFileName = "codecharta.cc.json"
        val isCompressed = true
        val isSilent = false
        val addAuthor = false

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns pathName andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isLogScan andThen isCompressed andThen isSilent andThen addAuthor

        val parserArguments = ParserDialog.collectParserArgs().drop(FIRST_ELEMENT)

        val cmdLine = CommandLine(RepoScanCommand())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())
        assertThat(parseResult.originalArgs()[0].equals("repo-scan"))
        assertThat(parseResult.matchedOption("repo-path").getValue<String>()).isEqualTo(pathName)
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertNull(parseResult.matchedOption("not-compressed"))
        assertThat(parseResult.matchedOption("silent").getValue<Boolean>()).isEqualTo(isSilent)
        assertThat(parseResult.matchedOption("add-author").getValue<Boolean>()).isEqualTo(addAuthor)
    }

    @Test
    fun `should output correct arguments for log-scan`() {
        val isLogScan = true
        val gitLogFileName = "git.log"
        val fileNameList = "file-name-list.txt"
        val outputFileName = "codecharta.cc.json"
        val isCompressed = false
        val isSilent = false
        val addAuthor = false

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns gitLogFileName andThen fileNameList andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isLogScan andThen isCompressed andThen isSilent andThen addAuthor

        val parserArguments = ParserDialog.collectParserArgs().drop(FIRST_ELEMENT)

        val cmdLine = CommandLine(LogScanCommand())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())
        assertThat(parseResult.originalArgs()[0].equals("log-scan"))
        assertThat(parseResult.matchedOption("git-log").getValue<File>().name).isEqualTo(gitLogFileName)
        assertThat(parseResult.matchedOption("repo-files").getValue<File>().name).isEqualTo(fileNameList)
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        assertThat(parseResult.matchedOption("silent").getValue<Boolean>()).isEqualTo(isSilent)
        assertThat(parseResult.matchedOption("add-author").getValue<Boolean>()).isEqualTo(addAuthor)
    }

    @Test
    fun `should output correct arguments for log-scan compressed`() {
        val isLogScan = true
        val gitLogFileName = "git.log"
        val fileNameList = "file-name-list.txt"
        val outputFileName = "codecharta.cc.json"
        val isCompressed = true
        val isSilent = false
        val addAuthor = false

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns gitLogFileName andThen fileNameList andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isLogScan andThen isCompressed andThen isSilent andThen addAuthor

        val parserArguments = ParserDialog.collectParserArgs().drop(FIRST_ELEMENT)

        val cmdLine = CommandLine(LogScanCommand())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())
        assertThat(parseResult.originalArgs()[0].equals("log-scan"))
        assertThat(parseResult.matchedOption("git-log").getValue<File>().name).isEqualTo(gitLogFileName)
        assertThat(parseResult.matchedOption("repo-files").getValue<File>().name).isEqualTo(fileNameList)
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertNull(parseResult.matchedOption("not-compressed"))
        assertThat(parseResult.matchedOption("silent").getValue<Boolean>()).isEqualTo(isSilent)
        assertThat(parseResult.matchedOption("add-author").getValue<Boolean>()).isEqualTo(addAuthor)
    }
}
