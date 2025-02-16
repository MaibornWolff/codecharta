package de.maibornwolff.codecharta.parser.gitlogparser

import com.varabyte.kotter.foundation.input.Keys
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
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.Timeout
import picocli.CommandLine
import java.io.File

@Timeout(120)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ParserDialogTest {
    private val outputFileName = "codecharta.cc.json"

    @Test
    fun `should return true for log-scan`() {
        testSession { terminal ->

            mockkObject(ParserDialog.Companion)

            every { ParserDialog.Companion.scanCallback() } returns {
                terminal.press(Keys.ENTER)
            }

            val isLogScan = collectSubcommand(this)
            assertThat(isLogScan).isTrue()
        }
    }

    @Test
    fun `should return false for log-scan`() {
        testSession { terminal ->

            mockkObject(ParserDialog.Companion)

            every { ParserDialog.Companion.scanCallback() } returns {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            val isLogScan = collectSubcommand(this)
            assertThat(isLogScan).isFalse()
        }
    }

    @Test
    fun `should collect log-scan subcommands correctly`() {
        val testResourceBaseFolder = "src/test/resources/"
        val logFileName = "${testResourceBaseFolder}codeCharta.log"
        val lsFileName = "${testResourceBaseFolder}names-in-git-repo.txt"
        val invalidFileName = "inv"

        mockkObject(LogScanParserDialog.Companion)

        testSession { terminal ->
            every { LogScanParserDialog.Companion.logCallback() } returns {
                terminal.type(invalidFileName)
                terminal.press(Keys.ENTER)
                terminal.press(Keys.BACKSPACE, Keys.BACKSPACE, Keys.BACKSPACE)
                terminal.type(logFileName)
                terminal.press(Keys.ENTER)
            }
            every { LogScanParserDialog.Companion.lsCallback() } returns {
                terminal.type(invalidFileName)
                terminal.press(Keys.ENTER)
                terminal.press(Keys.BACKSPACE, Keys.BACKSPACE, Keys.BACKSPACE)
                terminal.type(lsFileName)
                terminal.press(Keys.ENTER)
            }

            val parserArguments = LogScanParserDialog.collectParserArgs(this)
            val cmdLine = CommandLine(LogScanCommand())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedOption("git-log").getValue<File>().name).isEqualTo(File(logFileName).name)
            assertThat(parseResult.matchedOption("repo-files").getValue<File>().name).isEqualTo(File(lsFileName).name)
        }
    }

    @Test
    fun `should collect repo-scan subcommands correctly`() {
        val testResourceBaseFolder = "src/test/resources/"
        val repoFolderName = "${testResourceBaseFolder}my/"
        val invalidFileName = "inv"

        mockkObject(RepoScanParserDialog.Companion)

        testSession { terminal ->
            every { RepoScanParserDialog.Companion.repoCallback() } returns {
                terminal.type(invalidFileName)
                terminal.press(Keys.ENTER)
                terminal.press(Keys.BACKSPACE, Keys.BACKSPACE, Keys.BACKSPACE)
                terminal.type(repoFolderName)
                terminal.press(Keys.ENTER)
            }

            val parserArguments = RepoScanParserDialog.collectParserArgs(this)
            val cmdLine = CommandLine(RepoScanCommand())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())
            assertThat(File(parseResult.matchedOption("repo-path").getValue<String>())).isEqualTo(File(repoFolderName))
        }
    }

    @Test
    fun `should output correct arguments for standard questions`() {
        val isSilent = false
        val addAuthor = false

        mockkObject(ParserDialog.Companion)

        testSession { terminal ->
            every { ParserDialog.Companion.outFileCallback() } returns {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.compressCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.silentCallback() } returns {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.authorCallback() } returns {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            val parserArguments = collectGeneralArgs(this)

            val cmdLine = CommandLine(RepoScanCommand())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("not-compressed")).isNull()
            assertThat(parseResult.matchedOption("silent").getValue<Boolean>()).isEqualTo(isSilent)
            assertThat(parseResult.matchedOption("add-author").getValue<Boolean>()).isEqualTo(addAuthor)
        }
    }

    @Test
    fun `should not ask for compression if no file is given`() {
        val isSilent = true
        val addAuthor = true

        mockkObject(ParserDialog.Companion)

        testSession { terminal ->
            every { ParserDialog.Companion.outFileCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.silentCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.authorCallback() } returns {
                terminal.press(Keys.ENTER)
            }

            val parserArguments = collectGeneralArgs(this)

            val cmdLine = CommandLine(RepoScanCommand())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())
            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo("")
            assertThat(parseResult.matchedOption("not-compressed")).isNull()
            assertThat(parseResult.matchedOption("silent").getValue<Boolean>()).isEqualTo(isSilent)
            assertThat(parseResult.matchedOption("add-author").getValue<Boolean>()).isEqualTo(addAuthor)
        }
    }
}
