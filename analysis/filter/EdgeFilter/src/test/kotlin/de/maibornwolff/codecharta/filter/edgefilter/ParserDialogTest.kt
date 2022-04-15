package de.maibornwolff.codecharta.filter.edgefilter

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import io.mockk.every
import io.mockk.mockkStatic
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test

class ParserDialogTest {

    @Test
    fun `should output correct arguments`() {
        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns "sampleFile" andThen "sampleOutputFile" andThen "/"

        val parserArguments = ParserDialog.collectParserArgs()

        Assertions.assertThat(parserArguments).isEqualTo(listOf("sampleFile.cc.json", "-o sampleOutputFile", "--path-separator=/"))
    }
}
