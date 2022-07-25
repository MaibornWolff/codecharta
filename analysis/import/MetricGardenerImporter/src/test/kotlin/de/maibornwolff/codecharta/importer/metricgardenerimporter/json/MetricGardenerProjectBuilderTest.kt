package de.maibornwolff.codecharta.importer.metricgardenerimporter.json

import de.maibornwolff.codecharta.importer.metricgardenerimporter.model.MetricGardenerNode
import de.maibornwolff.codecharta.importer.metricgardenerimporter.model.MetricGardenerNodes
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import org.junit.Test
import org.junit.jupiter.api.Assertions.assertEquals

internal class MetricGardenerProjectBuilderTest {

    private val metricGardenerprojectBuilder: MetricGardenerProjectBuilder = MetricGardenerProjectBuilder(MetricGardenerNodes(mutableListOf(MetricGardenerNode("\\test-project\\path1\\test-project.path1.Logic\\Service\\TestService.kt",
            "File",
            mapOf("mcc" to 3, "functions" to 3, "classes" to 1, "lines_of_code" to 79, "comment_lines" to 32, "real_lines_of_code" to 40)), MetricGardenerNode("\\test-project\\path1\\test-project.path1.Logic\\Service\\UserLogonService.kt",
            "File", mapOf("mcc" to 34, "functions" to 8, "classes" to 1, "lines_of_code" to 188, "comment_lines" to 0, "real_lines_of_code" to 155)))))

    @Test
    fun whenExtractFileNameFromPathThenSuccess() {
        val privateExtractFileNameFromPathMethod = metricGardenerprojectBuilder.javaClass.getDeclaredMethod("extractFileNameFromPath", String::class.java)
        privateExtractFileNameFromPathMethod.isAccessible = true
        val fileName = privateExtractFileNameFromPathMethod.invoke(metricGardenerprojectBuilder, "\\test-project\\path1\\test-project.path1.Logic\\Service\\TestService.kt")
        assertEquals("TestService.kt", fileName)
    }

    @Test
    fun whenGenerateFileNodeThenSuccess() {
        val fileNode = metricGardenerprojectBuilder.generateCodeChartaFileNode(metricGardenerprojectBuilder.metricGardenerNodes.metricGardenerNodes.elementAt(0))
        val node = MutableNode("TestService.kt", NodeType.File, mapOf("mcc" to 3, "functions" to 3, "classes" to 1, "lines_of_code" to 79, "comment_lines" to 32, "real_lines_of_code" to 40), "", setOf())
        assertEquals(fileNode.name, node.name)
        assertEquals(fileNode.attributes, node.attributes)
    }
}
