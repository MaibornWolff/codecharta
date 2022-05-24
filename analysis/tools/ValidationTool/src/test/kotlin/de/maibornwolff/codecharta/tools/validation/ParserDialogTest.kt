package de.maibornwolff.codecharta.tools.validation

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import io.mockk.every
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe

class ParserDialogTest: Spek({
    describe("Parser dialog for Validator") {
        it("should output correct arguments for some input file") {
            mockkStatic("com.github.kinquirer.components.InputKt")
            every {
                KInquirer.promptInput(any(), any(), any())
            } returns "sampleFile.cc.json"

            val parserArguments = ParserDialog.collectParserArgs()

            Assertions.assertThat(parserArguments).isEqualTo(listOf("sampleFile.cc.json"))
        }

        afterEachTest {
            unmockkAll()
        }
    }
})
