package de.maibornwolff.codecharta.indentationlevelparser.metrics

import de.maibornwolff.codecharta.parser.rawtextparser.metrics.MetricsFactory
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test

class MetricsFactoryTest {
    @Test
    fun `should create all metrics`() {
        val metrics = MetricsFactory.create(listOf(), mapOf())

        Assertions.assertThat(metrics).hasSize(1)
    }

    @Test
    fun `should create selected metrics`() {
        val metrics = MetricsFactory.create(listOf("IndentationLevel"), mapOf())

        Assertions.assertThat(metrics.map { it.name }).containsExactly("IndentationLevel")
    }
}