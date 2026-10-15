package de.maibornwolff.codecharta.analysers.tools.gate.template

import de.maibornwolff.codecharta.analysers.tools.gate.config.ConfigReader
import de.maibornwolff.codecharta.analysers.tools.gate.config.FakeAnalyserCatalog
import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.analysers.tools.gate.rules.AnalysedFile
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class ConfigTemplateTest {
    private val files =
        listOf(
            AnalysedFile("src/Big.kt", mapOf("rloc" to 812.0, "complexity" to 37.0)),
            AnalysedFile("src/Small.kt", mapOf("rloc" to 1.0, "complexity" to 0.5))
        )
    private val analysers = listOf("rawtextparser", "unifiedparser")
    private val catalog = FakeAnalyserCatalog(
        mapOf(
            "rawtextparser" to listOf("tab-width"),
            "unifiedparser" to listOf("exclude", "file-extensions")
        )
    )

    @Test
    fun `should list every metric found with the lowest and highest value`() {
        // Arrange
        val template = ConfigTemplate(files, analysers, catalog)

        // Act
        val text = template.render()

        // Assert
        assertThat(text).contains("#   complexity: # found: min 0.5, max 37")
        assertThat(text).contains("#   rloc:       # found: min 1, max 812")
    }

    @Test
    fun `should list every analyser switched on with the options it takes`() {
        // Arrange
        val template = ConfigTemplate(files, analysers, catalog)

        // Act
        val text = template.render()

        // Assert
        assertThat(
            text
        ).contains(
            "#   rawtextparser: on\n#     ## options: tab-width\n#   unifiedparser: on\n#     ## options: exclude, file-extensions\n"
        )
    }

    @Test
    fun `should offer running the analysers in parallel, switched off`() {
        // Arrange
        val template = ConfigTemplate(files, analysers, catalog)

        // Act
        val text = template.render()

        // Assert
        assertThat(text).contains("# parallel: off")
    }

    @Test
    fun `should leave every line commented out so the file checks nothing yet`() {
        // Arrange
        val template = ConfigTemplate(files, analysers, catalog)

        // Act
        val text = template.render()

        // Assert
        assertThat(text.lines().filter { it.isNotBlank() }).allMatch { it.startsWith("#") }
        val result = ConfigReader(catalog).read(text)
        assertThat(result.problems).isEmpty()
        assertThat(result.config).isEqualTo(GateConfig())
    }

    @Test
    fun `should become a valid config once a rule is uncommented and filled in`() {
        // Arrange
        val text = ConfigTemplate(files, analysers, catalog).render()
        val uncommented = text.lines().joinToString("\n") { it.removePrefix("# ") }.replace("max:\n", "max: 100\n")

        // Act
        val result = ConfigReader(catalog).read(uncommented)

        // Assert
        assertThat(result.problems).isEmpty()
        assertThat(result.config.metrics.keys).containsExactly("complexity", "rloc")
    }
}
