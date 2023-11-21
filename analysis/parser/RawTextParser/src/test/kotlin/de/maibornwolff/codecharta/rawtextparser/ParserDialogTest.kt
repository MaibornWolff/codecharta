package de.maibornwolff.codecharta.rawtextparser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import com.github.kinquirer.components.promptInputNumber
import de.maibornwolff.codecharta.parser.rawtextparser.ParserDialog
import de.maibornwolff.codecharta.parser.rawtextparser.RawTextParser
import io.mockk.every
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import picocli.CommandLine
import java.io.File
import java.math.BigDecimal

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ParserDialogTest {

    @AfterAll
    fun afterTest() {
        unmockkAll()
    }

    companion object {
        @JvmStatic
        fun provideInvalidTabWidth(): List<Arguments> {
            return listOf(
                    Arguments.of("string-value"),
                    Arguments.of(""),
                    Arguments.of("12."),
                    Arguments.of("12.0"))
        }
    }

    private fun setupMockedInquirer(
            fileName: String,
            outputFileName: String,
            metrics: String,
            tabWidth: String,
            exclude: String,
            fileExtensions: String,
            maxIndentLvl: BigDecimal,
            isCompressed: Boolean,
            verbose: Boolean,
            withoutDefaultExcludes: Boolean
                                   ) {
        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns fileName andThen outputFileName andThen metrics andThen tabWidth andThen exclude andThen fileExtensions
        every {
            KInquirer.promptInputNumber(any(), any(), any())
        } returns maxIndentLvl
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed andThen verbose andThen withoutDefaultExcludes
    }

    @Test
    fun `should output correct arguments that can be parsed`() {
        val fileName = "test.txt"
        val outputFileName = "test.cc.json"
        val isCompressed = false
        val verbose = false
        val metrics = "metric1"
        val tabWidth = "5"
        val tabWidthValue = 5
        val maxIndentLvl = BigDecimal(10)
        val exclude = "file1"
        val fileExtensions = ""
        val withoutDefaultExcludes = false

        setupMockedInquirer(fileName, outputFileName, metrics, tabWidth, exclude, fileExtensions, maxIndentLvl, isCompressed, verbose, withoutDefaultExcludes)

        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(RawTextParser())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>().equals(outputFileName))
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        Assertions.assertThat(parseResult.matchedOption("metrics").getValue<List<String>>()).isEqualTo(listOf(metrics))
        Assertions.assertThat(parseResult.matchedOption("max-indentation-level").getValue<Int>()).isEqualTo(maxIndentLvl.toInt())
        Assertions.assertThat(parseResult.matchedOption("tab-width").getValue<Int>()).isEqualTo(tabWidthValue)
        Assertions.assertThat(parseResult.matchedOption("file-extensions").getValue<List<String>>()).isEqualTo(listOf<String>())
        Assertions.assertThat(parseResult.matchedOption("without-default-excludes").getValue<Boolean>()).isEqualTo(withoutDefaultExcludes)
        Assertions.assertThat(parseResult.matchedOption("verbose").getValue<Boolean>()).isEqualTo(withoutDefaultExcludes)
        Assertions.assertThat(parseResult.matchedOption("exclude").getValue<List<String>>()).isEqualTo(listOf(exclude))
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(fileName)
    }

    @ParameterizedTest
    @MethodSource("provideInvalidTabWidth")
    fun `should set non-integer tab-width to 0`(invalidTabWidth: String) {
        val fileName = "test.txt"
        val outputFileName = "test.cc.json"
        val isCompressed = false
        val verbose = false
        val metrics = "metric1"
        val tabWidthValue = 0
        val maxIndentLvl = BigDecimal(10)
        val exclude = "file1"
        val fileExtensions = ""
        val withoutDefaultExcludes = false

        setupMockedInquirer(fileName, outputFileName, metrics, invalidTabWidth, exclude, fileExtensions, maxIndentLvl, isCompressed, verbose, withoutDefaultExcludes)

        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(RawTextParser())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>().equals(outputFileName))
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        Assertions.assertThat(parseResult.matchedOption("metrics").getValue<List<String>>()).isEqualTo(listOf(metrics))
        Assertions.assertThat(parseResult.matchedOption("max-indentation-level").getValue<Int>()).isEqualTo(maxIndentLvl.toInt())
        Assertions.assertThat(parseResult.matchedOption("tab-width").getValue<Int>()).isEqualTo(tabWidthValue)
        Assertions.assertThat(parseResult.matchedOption("file-extensions").getValue<List<String>>()).isEqualTo(listOf<String>())
        Assertions.assertThat(parseResult.matchedOption("without-default-excludes").getValue<Boolean>()).isEqualTo(withoutDefaultExcludes)
        Assertions.assertThat(parseResult.matchedOption("verbose").getValue<Boolean>()).isEqualTo(withoutDefaultExcludes)
        Assertions.assertThat(parseResult.matchedOption("exclude").getValue<List<String>>()).isEqualTo(listOf(exclude))
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(fileName)
    }
}
