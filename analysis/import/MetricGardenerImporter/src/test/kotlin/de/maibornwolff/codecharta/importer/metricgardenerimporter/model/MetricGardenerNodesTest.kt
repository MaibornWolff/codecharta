package de.maibornwolff.codecharta.importer.metricgardenerimporter.model

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.junit.Test
import org.junit.jupiter.api.Assertions.assertEquals

internal class MetricGardenerNodesTest {

    private val mapper = jacksonObjectMapper()

    @Test
    fun whenDeserializeNodeList_thenSuccess() {
        val json = """{
            "nodes": [
            {
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
            },
            {
                "name": "\\test-project\\path1\\test-project.path1.Logic\\Service\\UserLogonService.kt",
                "type": "File",
                "metrics": {
                "mcc": 34,
                "functions": 8,
                "classes": 1,
                "lines_of_code": 188,
                "comment_lines": 0,
                "real_lines_of_code": 155
            },
                "types": []
            }
             ],
    "relationships": []
}"""
        val metricGardenerNodes: MetricGardenerNodes = mapper.readValue(json, MetricGardenerNodes::class.java)
        val metricGardenerNode1 = MetricGardenerNode("\\test-project\\path1\\test-project.path1.Logic\\Service\\TestService.kt",
                        "File", Metrics(3, 3, 1, 79, 32, 40))
        val metricGardenerNode2 = MetricGardenerNode("\\test-project\\path1\\test-project.path1.Logic\\Service\\UserLogonService.kt",
                "File", Metrics(34, 8, 1, 188, 0, 155))
        val metricGardenerNodes2 = MetricGardenerNodes(mutableListOf(metricGardenerNode1, metricGardenerNode2))
        assertEquals(metricGardenerNodes, metricGardenerNodes2)
    }
}
