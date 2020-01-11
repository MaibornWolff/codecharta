package de.maibornwolff.codecharta.indentationlevelparser.model

import de.maibornwolff.codecharta.importer.indentationlevelparser.model.FileMetrics
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test

class FileMetricsTest {
    @Test
    fun `Adding metric sould add metric to map`() {
        val fileMetric = FileMetrics()
        val result = mutableMapOf<String, Double>("foo" to 1.0, "bar" to 2.0)

        fileMetric.addMetric("foo", 1)
        fileMetric.addMetric("bar", 2)

        Assertions.assertThat(fileMetric.metricMap).isEqualTo(result)
    }
}