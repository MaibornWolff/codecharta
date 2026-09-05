package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.algorithms

import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model.NodeInformation
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model.build
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class StronglyConnectedComponentDetectionTest {
    @Test
    fun `returns two strongly connected components for two isolated nodes`() {
        // Arrange
        val node1 = NodeInformation.build(id = "node1", dependencies = setOf())
        val node2 = NodeInformation.build(id = "node2", dependencies = setOf())

        // Act
        val scc = StronglyConnectedComponentDetection().run(setOf(node1, node2))

        // Assert
        assertThat(scc).hasSize(2)
    }

    @Test
    fun `returns one strongly connected component for two nodes connected to each other`() {
        // Arrange
        val node1 = NodeInformation.build(id = "node1", dependencies = setOf("node2"))
        val node2 = NodeInformation.build(id = "node2", dependencies = setOf("node1"))

        // Act
        val scc = StronglyConnectedComponentDetection().run(setOf(node1, node2))

        // Assert
        assertThat(scc).hasSize(1)
        assertThat(scc[0].nodes).containsExactlyInAnyOrder(node1, node2)
    }

    @Test
    fun `returns two strongly connected component for two nodes connected to each other`() {
        // Arrange
        val node1 = NodeInformation.build(id = "node1", dependencies = setOf("node2"))
        val node2 = NodeInformation.build(id = "node2", dependencies = setOf("node1"))
        val node3 = NodeInformation.build(id = "node3", dependencies = setOf("node4", "node2"))
        val node4 = NodeInformation.build(id = "node4", dependencies = setOf("node3"))

        // Act
        val scc = StronglyConnectedComponentDetection().run(setOf(node1, node2, node3, node4))

        // Assert
        assertThat(scc).hasSize(2)
        assertThat(scc[0].nodes).containsExactlyInAnyOrder(node1, node2)
        assertThat(scc[1].nodes).containsExactlyInAnyOrder(node3, node4)
    }
}
