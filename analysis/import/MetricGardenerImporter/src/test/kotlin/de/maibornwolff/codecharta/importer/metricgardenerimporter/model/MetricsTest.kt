package de.maibornwolff.codecharta.importer.metricgardenerimporter.model

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.junit.Test
import org.junit.jupiter.api.Assertions.assertEquals

internal class MetricsTest {

    private val mapper = jacksonObjectMapper()

    @Test
    fun whenDeserializeMetrics_thenSuccess() {
        val json =
                """{"mcc":13, "functions":0,"classes":14,"lines_of_code":198,"comment_lines":0,"real_lines_of_code":198}"""
        val metrics: Metrics = mapper.readValue(json, Metrics::class.java)
        val metrics1 = Metrics(13, 0, 14, 198, 0, 198)
        assertEquals(metrics, metrics1)
    }
}
