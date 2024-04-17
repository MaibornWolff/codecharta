package de.maibornwolff.codecharta.rawtextparser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import com.github.kinquirer.components.promptInputNumber
import de.maibornwolff.codecharta.parser.rawtextparser.ParserDialog
import de.maibornwolff.codecharta.parser.rawtextparser.RawTextParser
import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterEach
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
@AfterEach
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should output correct arguments when provided with valid input`() {
        // given
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

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns true

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

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(RawTextParser())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>().equals(outputFileName))
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        Assertions.assertThat(parseResult.matchedOption("metrics").getValue<List<String>>()).isEqualTo(listOf(metrics))
        Assertions.assertThat(parseResult.matchedOption("max-indentation-level").getValue<Int>())
                .isEqualTo(maxIndentLvl.toInt())
        Assertions.assertThat(parseResult.matchedOption("tab-width").getValue<Int>()).isEqualTo(tabWidthValue)
        Assertions.assertThat(parseResult.matchedOption("file-extensions").getValue<List<String>>())
                .isEqualTo(listOf<String>())
        Assertions.assertThat(parseResult.matchedOption("without-default-excludes").getValue<Boolean>())
                .isEqualTo(withoutDefaultExcludes)
        Assertions.assertThat(parseResult.matchedOption("verbose").getValue<Boolean>())
                .isEqualTo(withoutDefaultExcludes)
        Assertions.assertThat(parseResult.matchedOption("exclude").getValue<List<String>>()).isEqualTo(listOf(exclude))
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(fileName)
    }

    @ParameterizedTest
    @MethodSource("provideInvalidTabWidth")
    fun `should set tab-width to 0 when non-integer tab-width provided`(invalidTabWidth: String) {
        // given
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

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns fileName andThen outputFileName andThen metrics andThen invalidTabWidth andThen exclude andThen fileExtensions
        every {
            KInquirer.promptInputNumber(any(), any(), any())
        } returns maxIndentLvl
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed andThen verbose andThen withoutDefaultExcludes

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(RawTextParser())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>().equals(outputFileName))
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        Assertions.assertThat(parseResult.matchedOption("metrics").getValue<List<String>>()).isEqualTo(listOf(metrics))
        Assertions.assertThat(parseResult.matchedOption("max-indentation-level").getValue<Int>())
                .isEqualTo(maxIndentLvl.toInt())
        Assertions.assertThat(parseResult.matchedOption("tab-width").getValue<Int>()).isEqualTo(tabWidthValue)
        Assertions.assertThat(parseResult.matchedOption("file-extensions").getValue<List<String>>())
                .isEqualTo(listOf<String>())
        Assertions.assertThat(parseResult.matchedOption("without-default-excludes").getValue<Boolean>())
                .isEqualTo(withoutDefaultExcludes)
        Assertions.assertThat(parseResult.matchedOption("verbose").getValue<Boolean>())
                .isEqualTo(withoutDefaultExcludes)
        Assertions.assertThat(parseResult.matchedOption("exclude").getValue<List<String>>()).isEqualTo(listOf(exclude))
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(fileName)
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        // given
        val invalidFileName = ""
        val validFileName = "test.txt"
        val outputFileName = "test.cc.json"
        val isCompressed = false
        val verbose = false
        val metrics = "metric1"
        val tabWidth = "5"
        val maxIndentLvl = BigDecimal(10)
        val exclude = "file1"
        val fileExtensions = ""
        val withoutDefaultExcludes = false

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns false andThen true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns invalidFileName andThen validFileName andThen outputFileName andThen metrics andThen tabWidth andThen exclude andThen fileExtensions
        every {
            KInquirer.promptInputNumber(any(), any(), any())
        } returns maxIndentLvl
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed andThen verbose andThen withoutDefaultExcludes

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(RawTextParser())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(validFileName)
    }

    private fun provideInvalidTabWidth(): List<Arguments> {
        return listOf(
                Arguments.of("string-value"),
                Arguments.of(""),
                Arguments.of("12."),
                Arguments.of("12.0"),
                     )
    }
}
