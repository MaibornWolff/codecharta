package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTableSum
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetricMap
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceDescriptor
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeType
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test

class JsonBuilderTest {

    @Test
    fun `project name matches`() {
        val projectName = "CoolProject"

        val project = JsonBuilder(projectName).build()

        assertThat(project.projectName).isEqualTo(projectName)
    }

    @Test
    fun `empty project has no nodes except root`() {
        val projectName = "CoolProject"

        val project = JsonBuilder(projectName).build()

        assertThat(project.rootNode.children.size).isEqualTo(0)
    }

    @Test
    fun `component without path is right under root`() {
        val projectName = "CoolProject"
        val fileSummary = DetailedMetricTableSum(
                SourceDescriptor("CoolComponent", "", OopLanguage.JAVA),
                OverviewMetricMap()
        )

        val project = JsonBuilder(projectName)
                .addComponentAsNode(fileSummary)
                .build()

        assertThat(project.rootNode.children[0].name).isEqualTo(fileSummary.sourceDescriptor.name)
    }

    @Test
    fun `project node matches metrics`() {
        val projectName = "CoolProject"
        val fileSummary = DetailedMetricTableSum(
                SourceDescriptor("CoolComponent", "", OopLanguage.JAVA),
                OverviewMetricMap(OverviewMetricType.LoC to 1)
        )

        val project = JsonBuilder(projectName)
                .addComponentAsNode(fileSummary)
                .build()

        assertThat(project.rootNode.children[0].attributes["lines_of_code"]).isEqualTo(fileSummary[OverviewMetricType.LoC])
    }

    @Test
    fun `project file node count matches components`() {
        val projectName = "CoolProject"

        val project = JsonBuilder(projectName)
                .addComponentAsNode(DetailedMetricTableSum(SourceDescriptor("CoolComponent1", "", OopLanguage.JAVA), OverviewMetricMap()))
                .addComponentAsNode(DetailedMetricTableSum(SourceDescriptor("CoolComponent2", "", OopLanguage.JAVA), OverviewMetricMap()))
                .addComponentAsNode(DetailedMetricTableSum(SourceDescriptor("CoolComponent3", "", OopLanguage.JAVA), OverviewMetricMap()))
                .build()

        assertThat(filterFiles(project.rootNode).size).isEqualTo(3)
    }

    private fun filterFiles(node: Node): List<Node> {
        val files = mutableListOf<Node>()
        node.children.forEach {
            if (it.type == NodeType.File) {
                files.add(it)
            } else {
                files.addAll(filterFiles(it))
            }
        }
        return files
    }

}