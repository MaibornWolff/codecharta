package de.maibornwolff.codecharta.importer.gitlogparser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.importer.gitlogparser.subcommands.LogScanCommand
import de.maibornwolff.codecharta.importer.gitlogparser.subcommands.RepoScanCommand
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
companion object {
private const val FIRST_ELEMENT = 1
    }

    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should output correct arguments when repo-scan is selected`() { // given
        val isLogScan = false
        val pathName = "path/to/repo"
        val outputFileName = "codecharta.cc.json"
        val isCompressed = false
        val isSilent = false
        val addAuthor = false

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns pathName andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isLogScan andThen isCompressed andThen isSilent andThen addAuthor

        // when
        val parserArguments = ParserDialog.collectParserArgs().drop(Companion.FIRST_ELEMENT)
        val cmdLine = CommandLine(RepoScanCommand())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedOption("repo-path").getValue<String>()).isEqualTo(pathName)
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        Assertions.assertThat(parseResult.matchedOption("silent").getValue<Boolean>()).isEqualTo(isSilent)
        Assertions.assertThat(parseResult.matchedOption("add-author").getValue<Boolean>()).isEqualTo(addAuthor)
    }

    @Test
    fun `should output correct arguments when repo-scan is selected and compress-flag is set`() { // given
        val isLogScan = false
        val pathName = "path/to/repo"
        val outputFileName = "codecharta.cc.json"
        val isCompressed = true
        val isSilent = false
        val addAuthor = false

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns pathName andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isLogScan andThen isCompressed andThen isSilent andThen addAuthor

        // when
        val parserArguments = ParserDialog.collectParserArgs().drop(Companion.FIRST_ELEMENT)
        val cmdLine = CommandLine(RepoScanCommand())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedOption("repo-path").getValue<String>()).isEqualTo(pathName)
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        Assertions.assertThat(parseResult.matchedOption("not-compressed")).isNull()
        Assertions.assertThat(parseResult.matchedOption("silent").getValue<Boolean>()).isEqualTo(isSilent)
        Assertions.assertThat(parseResult.matchedOption("add-author").getValue<Boolean>()).isEqualTo(addAuthor)
    }

    @Test
    fun `should output correct arguments when log-scan is selected`() { // given
        val isLogScan = true
        val gitLogFileName = "git.log"
        val fileNameList = "file-name-list.txt"
        val outputFileName = "codecharta.cc.json"
        val isCompressed = false
        val isSilent = false
        val addAuthor = false

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns true andThen true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns gitLogFileName andThen fileNameList andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isLogScan andThen isCompressed andThen isSilent andThen addAuthor

        // when
        val parserArguments = ParserDialog.collectParserArgs().drop(Companion.FIRST_ELEMENT)
        val cmdLine = CommandLine(LogScanCommand())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedOption("git-log").getValue<File>().name).isEqualTo(gitLogFileName)
        Assertions.assertThat(parseResult.matchedOption("repo-files").getValue<File>().name).isEqualTo(fileNameList)
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        Assertions.assertThat(parseResult.matchedOption("silent").getValue<Boolean>()).isEqualTo(isSilent)
        Assertions.assertThat(parseResult.matchedOption("add-author").getValue<Boolean>()).isEqualTo(addAuthor)
    }

    @Test
    fun `should output correct arguments when log-scan is selected and compress-flag is set`() { // given
        val isLogScan = true
        val gitLogFileName = "git.log"
        val fileNameList = "file-name-list.txt"
        val outputFileName = "codecharta.cc.json"
        val isCompressed = true
        val isSilent = false
        val addAuthor = false

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns true andThen true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns gitLogFileName andThen fileNameList andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isLogScan andThen isCompressed andThen isSilent andThen addAuthor

        // when
        val parserArguments = ParserDialog.collectParserArgs().drop(Companion.FIRST_ELEMENT)
        val cmdLine = CommandLine(LogScanCommand())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedOption("git-log").getValue<File>().name).isEqualTo(gitLogFileName)
        Assertions.assertThat(parseResult.matchedOption("repo-files").getValue<File>().name).isEqualTo(fileNameList)
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        Assertions.assertThat(parseResult.matchedOption("not-compressed")).isNull()
        Assertions.assertThat(parseResult.matchedOption("silent").getValue<Boolean>()).isEqualTo(isSilent)
        Assertions.assertThat(parseResult.matchedOption("add-author").getValue<Boolean>()).isEqualTo(addAuthor)
    }

    @Test
    fun `should prompt user twice for repo-path when first repo-path is invalid`() { // given
        val isLogScan = false
        val repoPathNameEmpty = ""
        val repoPathName = "path/to/repo"
        val outputFileName = "codecharta.cc.json"
        val isCompressed = false
        val isSilent = false
        val addAuthor = false

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns false andThen true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns repoPathNameEmpty andThen repoPathName andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isLogScan andThen isCompressed andThen isSilent andThen addAuthor

        // when
        val parserArguments = ParserDialog.collectParserArgs().drop(Companion.FIRST_ELEMENT)
        val cmdLine = CommandLine(RepoScanCommand())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedOption("repo-path").getValue<String>()).isEqualTo(repoPathName)
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() { // given
        val isLogScan = true
        val gitLogFileNameEmpty = ""
        val gitLogFileName = "git.log"
        val fileNameListEmpty = ""
        val fileNameList = "file-name-list.txt"
        val outputFileName = "codecharta.cc.json"
        val isCompressed = true
        val isSilent = false
        val addAuthor = false

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns false andThen true andThen false andThen true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns gitLogFileNameEmpty andThen gitLogFileName andThen fileNameListEmpty andThen fileNameList andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isLogScan andThen isCompressed andThen isSilent andThen addAuthor

        // when
        val parserArguments = ParserDialog.collectParserArgs().drop(Companion.FIRST_ELEMENT)
        val cmdLine = CommandLine(LogScanCommand())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedOption("git-log").getValue<File>().name).isEqualTo(gitLogFileName)
        Assertions.assertThat(parseResult.matchedOption("repo-files").getValue<File>().name).isEqualTo(fileNameList)
    }
}
