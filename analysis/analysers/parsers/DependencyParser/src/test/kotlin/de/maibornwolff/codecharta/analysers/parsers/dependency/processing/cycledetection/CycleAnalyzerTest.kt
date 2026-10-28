package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection

import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model.Cycle
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model.Edge
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model.NodeInformation
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model.build
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CycleAnalyzerTest {
    @Test
    fun `should return empty when there is no cycle`() {
        // Arrange
        val node1 = NodeInformation.build(id = "node1", dependencies = setOf("node2"))
        val node2 = NodeInformation.build(id = "node2", dependencies = setOf())

        // Act
        val cycles = CycleAnalyzer.determineCycles(setOf(node1, node2))

        // Assert
        assertThat(cycles).isEmpty()
    }

    @Test
    fun `should find cycles`() {
        // Arrange
        val node1 = NodeInformation.build(id = "node1", dependencies = setOf("node2"))
        val node2 = NodeInformation.build(id = "node2", dependencies = setOf("node1"))

        // Act
        val cycles = CycleAnalyzer.determineCycles(setOf(node1, node2))

        // Assert
        val expectedCycle = Cycle(listOf(Edge("node2", "node1"), Edge("node1", "node2")))

        assertThat(cycles).containsExactly(expectedCycle)
    }

    @Test
    fun `should return empty when there is only a cycle with one node`() {
        // Arrange
        val node1 = NodeInformation.build(id = "node1", dependencies = setOf("node1"))
        val node2 = NodeInformation.build(id = "node2", dependencies = setOf())

        // Act
        val cycles = CycleAnalyzer.determineCycles(setOf(node1, node2))

        // Assert
        assertThat(cycles).isEmpty()
    }

    @Test
    fun `should return one cycle for a component that holds several`() {
        // Arrange
        val node1 = NodeInformation.build(id = "node1", dependencies = setOf("node2", "node3"))
        val node2 = NodeInformation.build(id = "node2", dependencies = setOf("node1"))
        val node3 = NodeInformation.build(id = "node3", dependencies = setOf("node1"))

        // Act
        val cycles = CycleAnalyzer.determineCycles(setOf(node1, node2, node3))

        // Assert
        assertThat(cycles).hasSize(1)
    }

    @Test
    fun `should give every node the targets in its component as cyclic targets`() {
        // Arrange
        val node1 = NodeInformation.build(id = "node1", dependencies = setOf("node2", "node3", "node4"))
        val node2 = NodeInformation.build(id = "node2", dependencies = setOf("node1"))
        val node3 = NodeInformation.build(id = "node3", dependencies = setOf("node1"))
        val node4 = NodeInformation.build(id = "node4", dependencies = setOf())

        // Act
        val cyclicTargets = CycleAnalyzer.cyclicTargetsByNode(setOf(node1, node2, node3, node4))

        // Assert
        assertThat(cyclicTargets).isEqualTo(
            mapOf("node1" to setOf("node2", "node3"), "node2" to setOf("node1"), "node3" to setOf("node1"))
        )
    }

    @Test
    fun `should give every edge of a long cycle as cyclic`() {
        // Arrange
        val ringSize = 50
        val nodes = (0 until ringSize)
            .map { index ->
                NodeInformation.build(id = "node$index", dependencies = setOf("node${(index + 1) % ringSize}"))
            }.toSet()

        // Act
        val cyclicTargets = CycleAnalyzer.cyclicTargetsByNode(nodes)

        // Assert
        assertThat(cyclicTargets.values.sumOf { it.size }).isEqualTo(ringSize)
    }

    @Test
    fun `should give no cyclic targets when there is no cycle`() {
        // Arrange
        val node1 = NodeInformation.build(id = "node1", dependencies = setOf("node2"))
        val node2 = NodeInformation.build(id = "node2", dependencies = setOf())

        // Act
        val cyclicTargets = CycleAnalyzer.cyclicTargetsByNode(setOf(node1, node2))

        // Assert
        assertThat(cyclicTargets).isEmpty()
    }
}
