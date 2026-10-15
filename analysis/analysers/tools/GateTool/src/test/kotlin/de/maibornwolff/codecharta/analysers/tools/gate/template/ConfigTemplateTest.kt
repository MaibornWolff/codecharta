package de.maibornwolff.codecharta.analysers.tools.gate.template

import de.maibornwolff.codecharta.analysers.tools.gate.config.ConfigReader
import de.maibornwolff.codecharta.analysers.tools.gate.config.FakeAnalyserCatalog
import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity
import de.maibornwolff.codecharta.analysers.tools.gate.rules.AnalysedFile
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class ConfigTemplateTest {
    private val files =
        listOf(
            AnalysedFile("src/Big.kt", mapOf("rloc" to 812.0, "complexity" to 37.0)),
            AnalysedFile("src/Small.kt", mapOf("rloc" to 1.0, "complexity" to 0.5))
        )
    private val metrics = MetricSummary.allOf(files, mapOf("rloc" to "Real lines of code"))
    private val analysers = listOf("rawtextparser", "unifiedparser")
    private val catalog =
        FakeAnalyserCatalog(mapOf("rawtextparser" to listOf("tab-width"), "unifiedparser" to listOf("exclude", "file-extensions")))
    private val template = ConfigTemplate(metrics, analysers, catalog)

    @Test
    fun `should list every metric found with its range and what it measures, one line each`() {
        // Act
        val text = template.render()

        // Assert
        assertThat(text).contains("##   complexity  0.5 – 37\n", "##   rloc        1 – 812   Real lines of code\n")
    }

    @Test
    fun `should show one worked rule that today's worst file still passes`() {
        // Act
        val text = template.render()

        // Assert
        assertThat(text).contains("#   rloc:\n#     warning:\n#       max: 609\n", "#     error:\n#       max: 812\n")
    }

    @Test
    fun `should list every analyser switched on with the options it takes`() {
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
    fun `should check cycles between files as errors and the other dependency rules as warnings`() {
        // Arrange
        val uncommented = uncomment(template.render())

        // Act
        val dependencies = ConfigReader(catalog).read(uncommented).config.dependencies

        // Assert
        assertThat(dependencies.cyclesBetweenFiles?.severity).isEqualTo(Severity.ERROR)
        assertThat(dependencies.cyclesInsideFiles?.severity).isEqualTo(Severity.WARNING)
        assertThat(dependencies.upward?.severity).isEqualTo(Severity.WARNING)
    }

    @Test
    fun `should leave every line commented out so the file checks nothing yet`() {
        // Act
        val text = template.render()

        // Assert
        assertThat(text.lines().filter { it.isNotBlank() }).allMatch { it.startsWith("#") }
        val result = ConfigReader(catalog).read(text)
        assertThat(result.problems).isEmpty()
        assertThat(result.config).isEqualTo(GateConfig())
    }

    @Test
    fun `should become a valid config once everything is uncommented`() {
        // Arrange
        val uncommented = uncomment(template.render())

        // Act
        val result = ConfigReader(catalog).read(uncommented)

        // Assert
        assertThat(result.problems).isEmpty()
        assertThat(result.config.metrics.keys).containsExactly("rloc")
        assertThat(result.config.parallel).isFalse()
    }

    @Test
    fun `should leave out the example rule when the analysis found no metric`() {
        // Arrange
        val withoutMetrics = ConfigTemplate(emptyList(), analysers, catalog)

        // Act
        val result = ConfigReader(catalog).read(uncomment(withoutMetrics.render()))

        // Assert
        assertThat(result.problems).isEmpty()
        assertThat(result.config.metrics).isEmpty()
    }

    private fun uncomment(text: String) = text.lines().joinToString("\n") { it.removePrefix("# ") }
}
