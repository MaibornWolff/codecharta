import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.importer.coverage.CoverageImporter
import de.maibornwolff.codecharta.importer.coverage.ParserDialog
import de.maibornwolff.codecharta.importer.coverage.languages.getStrategyForLanguage
import io.mockk.every
import io.mockk.mockkObject
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.Timeout
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import picocli.CommandLine

@Timeout(120)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ParserDialogTest {
    private val outputFileName = "coverage_out.cc.json"
    private val testResourceBaseFolder = "src/test/resources/languages"
    private val reportFileName = "$testResourceBaseFolder/javascript/minimal_lcov.info"

    @BeforeEach
    fun setup() {
        mockkObject(ParserDialog)
    }

    private fun languageChoicesProvider(): List<Arguments> {
        val allStrategies = listOf("javascript")
        return allStrategies.map { language ->
            Arguments.of(
                language,
                "$testResourceBaseFolder/$language/${getStrategyForLanguage(language).defaultReportFileName}",
                "coverage_${language}_out.cc.json"
            )
        }
    }

    @Test
    fun `should output correct arguments when valid input is provided`() {
        testSession { terminal ->
            val languageCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            val reportFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(reportFileName)
                terminal.press(Keys.ENTER)
            }

            val outputFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }

            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { ParserDialog.testCallback() } returnsMany listOf(
                languageCallback,
                reportFileCallback,
                outputFileCallback,
                compressCallback
            )

            val parserArguments = ParserDialog.collectParserArgs(this)

            val cmdLine = CommandLine(CoverageImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositionals()[0].getValue<String>()).isEqualTo(reportFileName)
            assertThat(parseResult.matchedOption("language").getValue<String>()).isEqualTo("javascript")
            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isFalse()
        }
    }

    @Test
    fun `should output correct arguments when output file is not provided`() {
        testSession { terminal ->
            val languageCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            val reportFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(reportFileName)
                terminal.press(Keys.ENTER)
            }

            val outputFileCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            every { ParserDialog.testCallback() } returnsMany listOf(
                languageCallback,
                reportFileCallback,
                outputFileCallback
            )

            val parserArguments = ParserDialog.collectParserArgs(this)

            val cmdLine = CommandLine(CoverageImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositionals()[0].getValue<String>()).isEqualTo(reportFileName)
            assertThat(parseResult.matchedOption("language").getValue<String>()).isEqualTo("javascript")
            assertThat(parseResult.matchedOption("output-file")).isNull()
            assertThat(parseResult.matchedOption("not-compressed")).isNull()
        }
    }

    @ParameterizedTest
    @MethodSource("languageChoicesProvider")
    fun `should handle different supported languages correctly`(language: String, expectedReportFile: String, expectedOutputFile: String) {
        testSession { terminal ->
            val languageCallback: suspend RunScope.() -> Unit = {
                terminal.type(language)
                terminal.press(Keys.ENTER)
            }

            val reportFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(expectedReportFile)
                terminal.press(Keys.ENTER)
            }

            val outputFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(expectedOutputFile)
                terminal.press(Keys.ENTER)
            }

            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            every { ParserDialog.testCallback() } returnsMany listOf(
                languageCallback,
                reportFileCallback,
                outputFileCallback,
                compressCallback
            )

            val parserArguments = ParserDialog.collectParserArgs(this)

            val cmdLine = CommandLine(CoverageImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositionals()[0].getValue<String>()).isEqualTo(expectedReportFile)
            assertThat(parseResult.matchedOption("language").getValue<String>()).isEqualTo(language)
            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(expectedOutputFile)
            assertThat(parseResult.matchedOption("not-compressed")).isNull()
        }
    }

    @Test
    fun `should prompt user twice for report file when first input is invalid`() {
        val invalidReportFile = "$testResourceBaseFolder/javascript/invalid_existing_file.txt"
        val validReportFile = reportFileName

        testSession { terminal ->
            val languageCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            val reportFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(invalidReportFile)
                terminal.press(Keys.ENTER)

                repeat(invalidReportFile.length) {
                    terminal.press(Keys.BACKSPACE)
                }

                terminal.type(validReportFile)
                terminal.press(Keys.ENTER)
            }

            val outputFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }

            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            every { ParserDialog.testCallback() } returnsMany listOf(
                languageCallback,
                reportFileCallback,
                outputFileCallback,
                compressCallback
            )

            val parserArguments = ParserDialog.collectParserArgs(this)

            val cmdLine = CommandLine(CoverageImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositionals()[0].getValue<String>()).isEqualTo(validReportFile)
            assertThat(parseResult.matchedOption("language").getValue<String>()).isEqualTo("javascript")
            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("not-compressed")).isNull()
        }
    }
}
