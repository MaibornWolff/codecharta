package de.maibornwolff.codecharta.tools.validation

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import io.mockk.every
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ParserDialogTest {
@AfterEach
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should output correct arguments`() {
        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns "sampleFile.cc.json"

        val parserArguments = ParserDialog.collectParserArgs()

        Assertions.assertThat(parserArguments).isEqualTo(listOf("sampleFile.cc.json"))
    }
}
