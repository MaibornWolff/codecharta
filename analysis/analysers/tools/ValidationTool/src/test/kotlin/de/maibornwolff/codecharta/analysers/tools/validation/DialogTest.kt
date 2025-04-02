package de.maibornwolff.codecharta.analysers.tools.validation

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.analysers.tools.validation.Dialog.Companion.collectParserArgs
import io.mockk.every
import io.mockk.mockkObject
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Timeout
import picocli.CommandLine
import java.io.File

@Timeout(120)
class DialogTest {
    private val testResourceBaseFolder = "src/test/resources/"
    private val inputFileName = "${testResourceBaseFolder}validFile.cc.json"

    @Test
    fun `should output correct arguments`() {
        mockkObject(Dialog.Companion)

        testSession { terminal ->
            every { Dialog.Companion.testCallback() } returns {
                terminal.type(inputFileName)
                terminal.press(Keys.ENTER)
            }

            val parserArguments = collectParserArgs(this)

            val commandLine = CommandLine(ValidationTool())
            val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())
            assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(File(inputFileName).name)
        }
    }
}
