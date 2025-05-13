package de.maibornwolff.codecharta.analysers.importers.coverage

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
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
class DialogTest {
    private val outputFileName = "coverage_out.cc.json"
    private val testResourceBaseFolder = "src/test/resources/formats"
    private val reportFileName = "$testResourceBaseFolder/lcov/minimal_lcov.info"

    @BeforeEach
    fun setup() {
        mockkObject(Dialog)
    }

    private fun formatChoicesProvider(): List<Arguments> {
        return Format.entries.map { format ->
            Arguments.of(
                format.formatName,
                Format.entries.indexOf(format),
                // ensure this default report file exists, otherwise the test will not complete and run into timeout
                "$testResourceBaseFolder/${format.formatName.lowercase()}/${format.defaultReportFileName}",
                "coverage_${format.formatName}_out.cc.json"
            )
        }
    }

    @Test
    fun `should output correct arguments when valid input is provided`() {
        testSession { terminal ->
            val formatCallback: suspend RunScope.() -> Unit = {
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

            every { Dialog.testCallback() } returnsMany listOf(
                formatCallback,
                reportFileCallback,
                outputFileCallback,
                compressCallback
            )

            val parserArguments = Dialog.collectAnalyserArgs(this)

            val cmdLine = CommandLine(CoverageImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositionals()[0].getValue<String>()).isEqualTo(reportFileName)
            assertThat(parseResult.matchedOption("format").getValue<String>()).isEqualTo("lcov")
            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isFalse()
        }
    }

    @Test
    fun `should output correct arguments when output file is not provided`() {
        testSession { terminal ->
            val formatCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            val reportFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(reportFileName)
                terminal.press(Keys.ENTER)
            }

            val outputFileCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            every { Dialog.testCallback() } returnsMany listOf(
                formatCallback,
                reportFileCallback,
                outputFileCallback
            )

            val parserArguments = Dialog.collectAnalyserArgs(this)

            val cmdLine = CommandLine(CoverageImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositionals()[0].getValue<String>()).isEqualTo(reportFileName)
            assertThat(parseResult.matchedOption("format").getValue<String>()).isEqualTo("lcov")
            assertThat(parseResult.matchedOption("output-file")).isNull()
            assertThat(parseResult.matchedOption("not-compressed")).isNull()
        }
    }

    @ParameterizedTest
    @MethodSource("formatChoicesProvider")
    fun `should handle different supported formats correctly`(
        formatName: String,
        formatIndex: Int,
        expectedReportFile: String,
        expectedOutputFile: String
    ) {
        testSession { terminal ->
            val formatCallback: suspend RunScope.() -> Unit = {
                repeat(formatIndex) {
                    terminal.press(Keys.DOWN)
                }
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

            every { Dialog.testCallback() } returnsMany listOf(
                formatCallback,
                reportFileCallback,
                outputFileCallback,
                compressCallback
            )

            val parserArguments = Dialog.collectAnalyserArgs(this)

            val cmdLine = CommandLine(CoverageImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositionals()[0].getValue<String>()).isEqualTo(expectedReportFile)
            assertThat(parseResult.matchedOption("format").getValue<String>()).isEqualTo(formatName)
            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(expectedOutputFile)
            assertThat(parseResult.matchedOption("not-compressed")).isNull()
        }
    }

    @Test
    fun `should prompt user twice for report file when first input is invalid`() {
        val invalidReportFile = "$testResourceBaseFolder/javascript/invalid_existing_file.txt"
        val validReportFile = reportFileName

        testSession { terminal ->
            val formatCallback: suspend RunScope.() -> Unit = {
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

            every { Dialog.testCallback() } returnsMany listOf(
                formatCallback,
                reportFileCallback,
                outputFileCallback,
                compressCallback
            )

            val parserArguments = Dialog.collectAnalyserArgs(this)

            val cmdLine = CommandLine(CoverageImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositionals()[0].getValue<String>()).isEqualTo(validReportFile)
            assertThat(parseResult.matchedOption("format").getValue<String>()).isEqualTo("lcov")
            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("not-compressed")).isNull()
        }
    }
}
