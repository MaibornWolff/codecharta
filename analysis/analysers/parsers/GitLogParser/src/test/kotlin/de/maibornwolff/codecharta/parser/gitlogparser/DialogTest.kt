package de.maibornwolff.codecharta.parser.gitlogparser

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.parser.gitlogparser.ParserDialog.Companion.collectGeneralArgs
import de.maibornwolff.codecharta.parser.gitlogparser.ParserDialog.Companion.collectSubcommand
import de.maibornwolff.codecharta.parser.gitlogparser.subcommands.LogScanCommand
import de.maibornwolff.codecharta.parser.gitlogparser.subcommands.LogScanParserDialog
import de.maibornwolff.codecharta.parser.gitlogparser.subcommands.RepoScanCommand
import de.maibornwolff.codecharta.parser.gitlogparser.subcommands.RepoScanParserDialog
import io.mockk.every
import io.mockk.mockkObject
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Timeout
import picocli.CommandLine
import java.io.File

@Timeout(120)
class DialogTest {
    private val outputFileName = "codecharta.cc.json"

    @Test
    fun `should return true for log-scan`() {
        mockkObject(ParserDialog.Companion)

        var isLogScan = false

        testSession { terminal ->
            val collectSubcommandCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            every { ParserDialog.Companion.testCallback() } returnsMany listOf(
                collectSubcommandCallback
            )

            isLogScan = collectSubcommand(this)
        }

        assertThat(isLogScan).isTrue()
    }

    @Test
    fun `should return false for log-scan`() {
        mockkObject(ParserDialog.Companion)

        var isLogScan = false

        testSession { terminal ->
            val collectSubcommandCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { ParserDialog.Companion.testCallback() } returnsMany listOf(
                collectSubcommandCallback
            )

            isLogScan = collectSubcommand(this)
        }

        assertThat(isLogScan).isFalse()
    }

    @Test
    fun `should collect log-scan subcommands correctly`() {
        val testResourceBaseFolder = "src/test/resources/"
        val logFileName = "${testResourceBaseFolder}codeCharta.log"
        val lsFileName = "${testResourceBaseFolder}names-in-git-repo.txt"
        val invalidFileName = "inv"

        mockkObject(LogScanParserDialog.Companion)

        var parserArguments: List<String> = listOf()

        testSession { terminal ->
            val testCallback: suspend RunScope.() -> Unit = {
                terminal.type(invalidFileName)
                terminal.press(Keys.ENTER)
                terminal.press(Keys.BACKSPACE, Keys.BACKSPACE, Keys.BACKSPACE)
                terminal.type(logFileName)
                terminal.press(Keys.ENTER)
            }
            val lsCallback: suspend RunScope.() -> Unit = {
                terminal.type(invalidFileName)
                terminal.press(Keys.ENTER)
                terminal.press(Keys.BACKSPACE, Keys.BACKSPACE, Keys.BACKSPACE)
                terminal.type(lsFileName)
                terminal.press(Keys.ENTER)
            }

            every { LogScanParserDialog.Companion.testCallback() } returnsMany listOf(
                testCallback,
                lsCallback
            )

            parserArguments = LogScanParserDialog.collectParserArgs(this)
        }

        val cmdLine = CommandLine(LogScanCommand())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedOption("git-log").getValue<File>().name).isEqualTo(File(logFileName).name)
        assertThat(parseResult.matchedOption("repo-files").getValue<File>().name).isEqualTo(File(lsFileName).name)
    }

    @Test
    fun `should collect repo-scan subcommands correctly`() {
        val testResourceBaseFolder = "src/test/resources/"
        val repoFolderName = "${testResourceBaseFolder}my/"
        val invalidFileName = "inv"

        mockkObject(RepoScanParserDialog.Companion)

        var parserArguments: List<String> = listOf()

        testSession { terminal ->
            val repoScanCallback: suspend RunScope.() -> Unit = {
                terminal.type(invalidFileName)
                terminal.press(Keys.ENTER)
                terminal.press(Keys.BACKSPACE, Keys.BACKSPACE, Keys.BACKSPACE)
                terminal.type(repoFolderName)
                terminal.press(Keys.ENTER)
            }

            every { RepoScanParserDialog.Companion.testCallback() } returnsMany listOf(
                repoScanCallback
            )

            parserArguments = RepoScanParserDialog.collectParserArgs(this)
        }

        val cmdLine = CommandLine(RepoScanCommand())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())
        assertThat(File(parseResult.matchedOption("repo-path").getValue<String>())).isEqualTo(File(repoFolderName))
    }

    @Test
    fun `should output correct arguments for standard questions`() {
        val isSilent = false
        val addAuthor = false
        val isCompressed = false

        mockkObject(ParserDialog.Companion)

        var parserArguments: List<String> = listOf()

        testSession { terminal ->
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            val silentCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            val authorCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { ParserDialog.Companion.testCallback() } returnsMany listOf(
                outFileCallback,
                compressCallback,
                silentCallback,
                authorCallback
            )

            parserArguments = collectGeneralArgs(this)
        }

        val cmdLine = CommandLine(RepoScanCommand())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        assertThat(parseResult.matchedOption("silent").getValue<Boolean>()).isEqualTo(isSilent)
        assertThat(parseResult.matchedOption("add-author").getValue<Boolean>()).isEqualTo(addAuthor)
    }

    @Test
    fun `should not ask for compression if no file is given`() {
        val isSilent = true
        val addAuthor = true

        mockkObject(ParserDialog.Companion)

        var parserArguments: List<String> = listOf()

        testSession { terminal ->
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val silentCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val authorCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            every { ParserDialog.Companion.testCallback() } returnsMany listOf(
                outFileCallback,
                silentCallback,
                authorCallback
            )

            parserArguments = collectGeneralArgs(this)
        }

        val cmdLine = CommandLine(RepoScanCommand())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo("")
        assertThat(parseResult.matchedOption("not-compressed")).isNull()
        assertThat(parseResult.matchedOption("silent").getValue<Boolean>()).isEqualTo(isSilent)
        assertThat(parseResult.matchedOption("add-author").getValue<Boolean>()).isEqualTo(addAuthor)
    }

    @Test
    fun `should return correct arguments for log-scan`() {
        val testResourceBaseFolder = "src/test/resources/"
        val logFileName = "${testResourceBaseFolder}codeCharta.log"
        val lsFileName = "${testResourceBaseFolder}names-in-git-repo.txt"
        val outputFileName = "codecharta.cc.json"
        val isSilent = true
        val addAuthor = true

        mockkObject(ParserDialog.Companion)
        mockkObject(LogScanParserDialog.Companion)

        every { LogScanCommand().getDialog().collectParserArgs(any()) } returns listOf("--git-log=$logFileName", "--repo-files=$lsFileName")

        var parserArguments: List<String> = listOf()

        testSession { terminal ->
            val collectSubcommandCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val silentCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val authorCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            every { ParserDialog.Companion.testCallback() } returnsMany listOf(
                collectSubcommandCallback,
                outFileCallback,
                compressCallback,
                silentCallback,
                authorCallback
            )

            parserArguments = ParserDialog.collectParserArgs(this)
        }

        val mainCmdLine = CommandLine(GitLogParser())
        val mainParseResult = mainCmdLine.parseArgs(*parserArguments.toTypedArray())
        val subParseResult = mainParseResult.subcommands().first()

        assertThat(mainParseResult.asCommandLineList().size).isEqualTo(2)
        assertThat(mainParseResult.asCommandLineList()[0].commandSpec.name()).isEqualTo("gitlogparser")
        assertThat(mainParseResult.asCommandLineList()[1].commandSpec.name()).isEqualTo("log-scan")
        assertThat(subParseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(subParseResult.matchedOption("not-compressed")).isNull()
        assertThat(subParseResult.matchedOption("silent").getValue<Boolean>()).isEqualTo(isSilent)
        assertThat(subParseResult.matchedOption("add-author").getValue<Boolean>()).isEqualTo(addAuthor)
    }

    @Test
    fun `should return correct arguments for repo-scan`() {
        val testResourceBaseFolder = "src/test/resources/"
        val repoFolderName = "${testResourceBaseFolder}my/"
        val outputFileName = "codecharta.cc.json"
        val isSilent = true
        val addAuthor = true

        mockkObject(ParserDialog.Companion)
        mockkObject(RepoScanParserDialog.Companion)

        every { RepoScanCommand().getDialog().collectParserArgs(any()) } returns listOf("--repo-path=$repoFolderName")

        var parserArguments: List<String> = listOf()

        testSession { terminal ->
            val collectSubcommandCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val silentCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val authorCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            every { ParserDialog.Companion.testCallback() } returnsMany listOf(
                collectSubcommandCallback,
                outFileCallback,
                compressCallback,
                silentCallback,
                authorCallback
            )

            parserArguments = ParserDialog.collectParserArgs(this)
        }

        val cmdLine = CommandLine(GitLogParser())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())
        val subParseResult = parseResult.subcommands().first()

        assertThat(parseResult.asCommandLineList().size).isEqualTo(2)
        assertThat(parseResult.asCommandLineList()[0].commandSpec.name()).isEqualTo("gitlogparser")
        assertThat(parseResult.asCommandLineList()[1].commandSpec.name()).isEqualTo("repo-scan")
        assertThat(File(subParseResult.matchedOption("repo-path").getValue<String>())).isEqualTo(File(repoFolderName))
        assertThat(subParseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(subParseResult.matchedOption("silent").getValue<Boolean>()).isEqualTo(isSilent)
        assertThat(subParseResult.matchedOption("add-author").getValue<Boolean>()).isEqualTo(addAuthor)
    }
}
