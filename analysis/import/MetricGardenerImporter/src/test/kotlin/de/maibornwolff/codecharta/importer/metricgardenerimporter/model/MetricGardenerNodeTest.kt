package de.maibornwolff.codecharta.importer.metricgardenerimporter.model

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.junit.Test
import org.junit.jupiter.api.Assertions.assertEquals

internal class MetricGardenerNodeTest {

    private val mapper = jacksonObjectMapper()

    @Test
    fun whenDeserializeNode_thenSuccess() {
        val json = """{
            "name": "\\test-project\\path1\\test-project.path1.Logic\\Service\\TestService.kt",
            "type": "File",
            "metrics": {
                "mcc": 3,
                "functions": 3,
                "classes": 1,
                "lines_of_code": 79,
                "comment_lines": 32,
                "real_lines_of_code": 40
            },
            "types": []
        }"""
        val metricGardenerNode: MetricGardenerNode = mapper.readValue(json, MetricGardenerNode::class.java)
        val metricGardenerNode1 = MetricGardenerNode("\\test-project\\path1\\test-project.path1.Logic\\Service\\TestService.kt", "File",
                mapOf("mcc" to 3, "functions" to 3, "classes" to 1, "lines_of_code" to 79, "comment_lines" to 32, "real_lines_of_code" to 40))
        assertEquals(metricGardenerNode, metricGardenerNode1)
    }
}
