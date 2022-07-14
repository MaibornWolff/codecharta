package de.maibornwolff.codecharta.importer.metricgardenerimporter.json

import de.maibornwolff.codecharta.importer.metricgardenerimporter.model.MetricGardenerNode
import de.maibornwolff.codecharta.importer.metricgardenerimporter.model.MetricGardenerNodes
import de.maibornwolff.codecharta.importer.metricgardenerimporter.model.Metrics
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import org.junit.Test
import org.junit.jupiter.api.Assertions.assertEquals

internal class MetricGardenerProjectBuilderTest {

    private val metricGardenerprojectBuilder: MetricGardenerProjectBuilder = MetricGardenerProjectBuilder(MetricGardenerNodes(mutableListOf(MetricGardenerNode("\\test-project\\path1\\test-project.path1.Logic\\Service\\TestService.kt",
            "File", Metrics(3, 3, 1, 79, 32, 40)), MetricGardenerNode("\\test-project\\path1\\test-project.path1.Logic\\Service\\UserLogonService.kt",
            "File", Metrics(34, 8, 1, 188, 0, 155)))))

    @Test
    fun whenExtractFileNameFromPathThenSuccess() {
        val privateExtractFileNameFromPathMethod = metricGardenerprojectBuilder.javaClass.getDeclaredMethod("extractFileNameFromPath", String::class.java)
        privateExtractFileNameFromPathMethod.isAccessible = true
        val fileName = privateExtractFileNameFromPathMethod.invoke(metricGardenerprojectBuilder, "\\test-project\\path1\\test-project.path1.Logic\\Service\\TestService.kt")
        assertEquals("TestService.kt", fileName)
    }

    @Test
    fun whenGenerateFileNodeThenSuccess() {
        /**
        val privateGenerateFileNodeMethod=metricGardenerprojectBuilder.javaClass.getDeclaredMethod("generateCodeChartaFileNode", MutableNode::class.java)
        privateGenerateFileNodeMethod.isAccessible=true
        val fileNode=privateGenerateFileNodeMethod.invoke(metricGardenerprojectBuilder,metricGardenerprojectBuilder.metricGardenerNodes.metricGardenerNodes.elementAt(0))
        **/
        val fileNode = metricGardenerprojectBuilder.generateCodeChartaFileNode(metricGardenerprojectBuilder.metricGardenerNodes.metricGardenerNodes.elementAt(0))
        val node = MutableNode("TestService.kt", NodeType.File, mapOf("mcc" to 3, "functions" to 3, "classes" to 1, "lines_of_code" to 79, "comment_lines" to 32, "real_lines_of_code" to 40), "", setOf())
        assertEquals(fileNode.name, node.name)
        assertEquals(fileNode.attributes, node.attributes)
    }

    @Test
    fun whenGenerateFolderNodesThenSuccess() {
    }
}
