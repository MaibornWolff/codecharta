package de.maibornwolff.codecharta.analysers.tools.gate.analysis

import de.maibornwolff.codecharta.analysers.parsers.rawtext.RawTextParser
import de.maibornwolff.codecharta.analysers.parsers.unified.UnifiedParser
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class PicocliAnalyserCatalogTest {
    private val catalog = PicocliAnalyserCatalog { listOf(RawTextParser(), UnifiedParser()) }

    @Test
    fun `should name every analyser`() {
        // Arrange & Act
        val names = catalog.names

        // Assert
        assertThat(names).containsExactly("rawtextparser", "unifiedparser")
    }

    @Test
    fun `should offer the long options of an analyser except the ones the gate sets itself`() {
        // Arrange & Act
        val options = catalog.optionNames("unifiedparser")

        // Assert
        assertThat(options).contains("exclude", "file-extensions", "bypass-gitignore")
        assertThat(options).doesNotContain("output-file", "not-compressed", "help")
    }

    @Test
    fun `should accept arguments the analyser can parse`() {
        // Arrange
        val arguments = listOf("--max-indentation-level=4", "--exclude=generated/")

        // Act
        val problem = catalog.checkArguments("rawtextparser", arguments)

        // Assert
        assertThat(problem).isNull()
    }

    @Test
    fun `should explain why the analyser refuses an argument`() {
        // Arrange
        val arguments = listOf("--max-indentation-level=lots")

        // Act
        val problem = catalog.checkArguments("rawtextparser", arguments)

        // Assert
        assertThat(problem).contains("lots")
    }
}
