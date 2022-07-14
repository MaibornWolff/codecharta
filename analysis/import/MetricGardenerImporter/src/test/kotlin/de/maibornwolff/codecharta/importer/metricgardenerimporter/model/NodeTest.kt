package de.maibornwolff.codecharta.importer.metricgardenerimporter.model

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.junit.Test
import org.junit.jupiter.api.Assertions.assertEquals

internal class NodeTest {

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
        val node: Node = mapper.readValue(json, Node::class.java)
        val metrics1 = Metrics(3, 3, 1, 79, 32, 40)
        val node1 = Node("\\test-project\\path1\\test-project.path1.Logic\\Service\\TestService.kt", "File", metrics1)
        assertEquals(node, node1)
    }
}
