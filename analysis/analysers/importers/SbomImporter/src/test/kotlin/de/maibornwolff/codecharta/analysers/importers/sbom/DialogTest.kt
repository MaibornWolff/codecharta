package de.maibornwolff.codecharta.analysers.importers.sbom

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.analysers.importers.sbom.Dialog.Companion.collectAnalyserArgs
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Timeout
import picocli.CommandLine
import java.io.File

@Timeout(120)
class DialogTest {
    private val sbomFile = "src/test/resources/trivy_sample.cdx.json"

    @AfterEach
    fun tearDown() {
        unmockkAll()
    }

    @Test
    fun `should ask for the SBOM, the project folder, both lookups and the output file`() {
        // Arrange
        mockkObject(Dialog.Companion)

        testSession { terminal ->
            every { Dialog.testCallback() } returnsMany listOf(
                typed(terminal, sbomFile),
                typed(terminal, "shop"),
                pressed(terminal, Keys.LEFT),
                pressed(terminal),
                typed(terminal, "sbom.cc.json")
            )

            // Act
            val arguments = collectAnalyserArgs(this)

            // Assert
            val parseResult = CommandLine(SbomImporter()).parseArgs(*arguments.toTypedArray())
            assertThat(parseResult.matchedPositional(0).getValue<File>().path).isEqualTo(sbomFile)
            assertThat(parseResult.matchedOption("project-folder").getValue<File>().path).isEqualTo("shop")
            assertThat(parseResult.hasMatchedOption("osv")).isTrue()
            assertThat(parseResult.hasMatchedOption("deps-dev")).isFalse()
            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo("sbom.cc.json")
        }
    }

    @Test
    fun `should leave out the options the user skipped`() {
        // Arrange
        mockkObject(Dialog.Companion)

        testSession { terminal ->
            every { Dialog.testCallback() } returnsMany listOf(
                typed(terminal, sbomFile),
                pressed(terminal),
                pressed(terminal),
                pressed(terminal),
                pressed(terminal)
            )

            // Act
            val arguments = collectAnalyserArgs(this)

            // Assert
            assertThat(arguments).containsExactly(sbomFile)
        }
    }

    private fun typed(terminal: com.varabyte.kotter.runtime.terminal.inmemory.InMemoryTerminal, text: String): suspend RunScope.() -> Unit =
        {
            terminal.type(text)
            terminal.press(Keys.ENTER)
        }

    private fun pressed(
        terminal: com.varabyte.kotter.runtime.terminal.inmemory.InMemoryTerminal,
        vararg keys: com.varabyte.kotter.foundation.input.Key
    ): suspend RunScope.() -> Unit = {
        keys.forEach { terminal.press(it) }
        terminal.press(Keys.ENTER)
    }
}
