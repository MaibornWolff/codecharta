package de.maibornwolff.codecharta.filter.edgefilter

import com.github.kinquirer.KInquirer
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
    fun `should output correct arguments when provided with valid input`() { // given
        mockkObject(InputHelper)
        every {
            InputHelper.isInputValidAndNotNull(any(), any())
        } returns true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns "sampleFile.cc.json" andThen "sampleOutputFile" andThen "/"

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val cmdLine = CommandLine(EdgeFilter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo("sampleOutputFile")
        Assertions.assertThat(parseResult.matchedOption("path-separator").getValue<Char>()).isEqualTo('/')
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>()).isEqualTo(File("sampleFile.cc.json"))
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() { // given
        mockkObject(InputHelper)
        every {
            InputHelper.isInputValidAndNotNull(any(), any())
        } returns false andThen true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns "" andThen "sampleFile.cc.json" andThen "sampleOutputFile" andThen "/"

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val cmdLine = CommandLine(EdgeFilter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>()).isEqualTo(File("sampleFile.cc.json"))
    }
}
