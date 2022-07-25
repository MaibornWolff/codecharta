package de.maibornwolff.codecharta.importer.metricgardenerimporter.model

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.maibornwolff.codecharta.model.Path
import org.junit.Assert.assertNotEquals
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
        val metricGardenerNode1 =
                MetricGardenerNode("\\test-project\\path1\\test-project.path1.Logic\\Service\\TestService.kt", "File",
                        mapOf("mcc" to 3, "functions" to 3, "classes" to 1, "lines_of_code" to 79,
                                "comment_lines" to 32, "real_lines_of_code" to 40))
        val metricGardenerNode2 =
                MetricGardenerNode("\\test-project\\path2\\test-project.path1.UI\\Service\\TestService.kt", "File",
                        mapOf("mcc" to 3, "functions" to 3, "classes" to 1, "lines_of_code" to 79,
                                "comment_lines" to 32, "real_lines_of_code" to 40))
        val metricGardenerNode3 =
                MetricGardenerNode("\\test-project\\path1\\test-project.path1.Logic\\Service\\TestService.kt", "Folder",
                        mapOf("mcc" to 3, "functions" to 3, "classes" to 1, "lines_of_code" to 79,
                                "comment_lines" to 32, "real_lines_of_code" to 40))
        val metricGardenerNode4 =
                MetricGardenerNode("\\test-project\\path1\\test-project.path1.Logic\\Service\\TestService.kt", "File",
                        mapOf("mcc" to 1, "functions" to 4, "classes" to 1, "lines_of_code" to 79,
                                "comment_lines" to 32, "real_lines_of_code" to 40))
        assertEquals(metricGardenerNode, metricGardenerNode1)
        assertEquals(metricGardenerNode.hashCode(), metricGardenerNode1.hashCode())
        assertNotEquals(metricGardenerNode, metricGardenerNode2)
        assertNotEquals(metricGardenerNode, metricGardenerNode3)
        assertNotEquals(metricGardenerNode, metricGardenerNode4)
    }

    @Test
    fun whenGetPathWithoutFileNameNonemptyPath_thenSuccess() {
        val metricGardenerNode1 =
                MetricGardenerNode("\\test-project\\path1\\test-project.path1.Logic\\Service\\TestService.kt", "File",
                        mapOf("mcc" to 3, "functions" to 3, "classes" to 1, "lines_of_code" to 79,
                                "comment_lines" to 32, "real_lines_of_code" to 40))
        val pathWithoutFileName = metricGardenerNode1.getPathWithoutFileName()
        assertEquals(Path(listOf("", "test-project", "path1", "test-project.path1.Logic", "Service")), pathWithoutFileName)
    }

    @Test
    fun whenGetPathWithoutFileNameNullPath_thenSuccess() {
        val metricGardenerNode1 =
                MetricGardenerNode(null, "File",
                        mapOf("mcc" to 3, "functions" to 3, "classes" to 1, "lines_of_code" to 79,
                                "comment_lines" to 32, "real_lines_of_code" to 40))
        val pathWithoutFileName = metricGardenerNode1.getPathWithoutFileName()
        assertEquals(Path(emptyList()), pathWithoutFileName)
    }
}
