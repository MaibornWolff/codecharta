package de.maibornwolff.codecharta.filter.edgefilter

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import io.mockk.every
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance

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

        Assertions.assertThat(parserArguments).isEqualTo(listOf("sampleFile.cc.json", "-o sampleOutputFile", "--path-separator=/"))
    }
}
