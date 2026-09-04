package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization

import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization.model.GraphNode
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization.model.GraphNodeBuilder
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.tuple
import org.junit.jupiter.api.Test

class LevelizerTest {
    @Test
    fun `should levelize correctly and remove cycle of application-domain`() {
        // given
        val rootPackage = "de.sots.cellarsandcentaurs"
        val adapterNode = GraphNodeBuilder(id = "adapter", parent = rootPackage)
            .withEdge("$rootPackage.domain", 1)
            .build()
        val applicationNode = GraphNodeBuilder(id = "application", parent = rootPackage)
            .withEdge("$rootPackage.domain", 1)
            .build()
        val domainNode = GraphNodeBuilder(id = "domain", parent = rootPackage)
            .withEdge("$rootPackage.application", 1)
            .build()
        val cellarsandcentaursNode = GraphNodeBuilder(id = rootPackage)
            .withChildren(adapterNode, applicationNode, domainNode)
            .build()

        // when
        val leveledNodes = levelize(listOf(cellarsandcentaursNode))

        // then
        val cellarsandcentaurs = leveledNodes.first()
        assertThat(cellarsandcentaurs.level).isEqualTo(0)

        val adapter = cellarsandcentaurs.children.first { it.id.contains("adapter") }
        assertThat(adapter.level).isEqualTo(1)

        val application = cellarsandcentaurs.children.first { it.id.contains("application") }
        assertThat(application.level).isEqualTo(1)

        val domain = cellarsandcentaurs.children.first { it.id.contains("domain") }
        assertThat(domain.level).isEqualTo(0)
    }

    @Test
    fun `should level a class at zero when it only depends on classes in other packages`() {
        // given
        val rootPackage = "de.sots.cellarsandcentaurs"
        val creatureFacade = GraphNodeBuilder(id = "CreatureFacade", parent = "$rootPackage.application")
            .withEdge("$rootPackage.domain.model", 3)
            .build()
        val creatureUtil = GraphNodeBuilder(id = "CreatureUtil", parent = "$rootPackage.application")
            .build()
        val applicationNode = GraphNodeBuilder(id = "application", parent = rootPackage)
            .withChildren(creatureFacade, creatureUtil)
            .build()
        val domainNode = GraphNodeBuilder(id = "domain", parent = rootPackage)
            .build()
        val cellarsandcentaursNode = GraphNodeBuilder(id = rootPackage)
            .withChildren(applicationNode, domainNode)
            .build()

        // when
        val leveledNodes = levelize(listOf(cellarsandcentaursNode))

        // then
        val cellarsandcentaurs = leveledNodes.first()
        val domain = cellarsandcentaurs.children.first { it.id.contains("domain") }
        assertThat(domain.level).isEqualTo(0)
        val application = cellarsandcentaurs.children.first { it.id.contains("application") }
        assertThat(application.level).isEqualTo(1)

        assertThat(application.children.map { it.level }).isEqualTo(listOf(0, 0))
    }

    @Test
    fun `should break a cycle at the edge into the node with the least incoming weight`() {
        // given
        val rootPackage = "de.sots.cellarsandcentaurs"
        val applicationNode = GraphNodeBuilder(id = "application", parent = rootPackage)
            .withEdge("$rootPackage.domain", 8)
            .build()
        val domainNode = GraphNodeBuilder(id = "domain", parent = rootPackage)
            .withEdge("$rootPackage.application", 2)
            .build()
        val cellarsandcentaursNode = GraphNodeBuilder(id = rootPackage)
            .withChildren(applicationNode, domainNode)
            .build()

        // when
        val leveledNodes = levelize(listOf(cellarsandcentaursNode))

        // then
        val domain = leveledNodes.first().children.first { it.id.contains("domain") }
        assertThat(domain.level).isEqualTo(0)

        val application = leveledNodes.first().children.first { it.id.contains("application") }
        assertThat(application.level).isEqualTo(1)
    }

    @Test
    fun `should handle empty input`() {
        // given
        val rootNodes = emptyList<GraphNode>()

        // when
        val leveledNodes = levelize(rootNodes)

        // then
        assertThat(leveledNodes).isEmpty()
    }

    @Test
    fun `should handle multiple root nodes`() {
        // given
        val rootNode1 = GraphNodeBuilder(id = "root1").build()
        val rootNode2 = GraphNodeBuilder(id = "root2")
            .withEdge("root1", 1)
            .build()

        // when
        val leveledNodes = levelize(listOf(rootNode1, rootNode2))

        // then
        assertThat(leveledNodes)
            .extracting({ it.id }, { it.level })
            .containsExactlyInAnyOrder(
                tuple("root1", 0),
                tuple("root2", 1)
            )
    }
}
