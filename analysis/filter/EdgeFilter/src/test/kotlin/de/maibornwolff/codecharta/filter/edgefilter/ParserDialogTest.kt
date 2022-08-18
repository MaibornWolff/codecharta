package de.maibornwolff.codecharta.filter.edgefilter

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import io.mockk.every
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import picocli.CommandLine

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ParserDialogTest {

    @AfterAll
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should output correct arguments`() {
        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns "sampleFile.cc.json" andThen "sampleOutputFile" andThen "/"

        val parserArguments = ParserDialog.collectParserArgs()

        assertThat(parserArguments)
            .isEqualTo(listOf("sampleFile.cc.json", "--output-file=sampleOutputFile", "--path-separator=/"))
    }

    @Test
    fun `should output arguments that are parsed correctly`() {
        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns "sampleFile.cc.json" andThen "sampleOutputFile" andThen "/"

        val parserArguments = ParserDialog.collectParserArgs()
        val cmdLine = CommandLine(EdgeFilter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo("sampleOutputFile")
        assertThat(parseResult.matchedOption("path-separator").getValue<Char>()).isEqualTo('/')
        assertThat(parseResult.matchedPositional(0).getValue<String>()).isEqualTo("sampleFile.cc.json")
    }
}
