package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection

import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.CycleAnalyzer.Companion.groupByLeafs
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model.Cycle
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model.Edge
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model.NodeInformation
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model.build
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CycleAnalyzerTest {
    @Test
    fun `should return empty when there is no cycle`() {
        // given
        val node1 = NodeInformation.build(id = "node1", dependencies = setOf("node2"))
        val node2 = NodeInformation.build(id = "node2", dependencies = setOf())

        // when
        val cycles = CycleAnalyzer.determineCycles(setOf(node1, node2))

        // then
        assertThat(cycles).isEmpty()
    }

    @Test
    fun `should find cycles`() {
        // given
        val node1 = NodeInformation.build(id = "node1", dependencies = setOf("node2"))
        val node2 = NodeInformation.build(id = "node2", dependencies = setOf("node1"))

        // when
        val cycles = CycleAnalyzer.determineCycles(setOf(node1, node2))

        // then
        val expectedCycle = Cycle(listOf(Edge("node2", "node1"), Edge("node1", "node2")))

        assertThat(cycles).containsExactly(expectedCycle)
    }

    @Test
    fun `should return empty when there is only a cycle with one node`() {
        // given
        val node1 = NodeInformation.build(id = "node1", dependencies = setOf("node1"))
        val node2 = NodeInformation.build(id = "node2", dependencies = setOf())

        // when
        val cycles = CycleAnalyzer.determineCycles(setOf(node1, node2))

        // then
        assertThat(cycles).isEmpty()
    }

    @Test
    fun `should return one cycle for a singleCycle search of a component that holds several`() {
        // given
        val node1 = NodeInformation.build(id = "node1", dependencies = setOf("node2", "node3"))
        val node2 = NodeInformation.build(id = "node2", dependencies = setOf("node1"))
        val node3 = NodeInformation.build(id = "node3", dependencies = setOf("node1"))

        // when
        val cycles = CycleAnalyzer.determineCycles(setOf(node1, node2, node3), true)

        // then
        assertThat(cycles).hasSize(1)
    }

    @Test
    fun `should return all cycles when there is more than one cycle in the strongly connected component`() {
        // given
        val node1 = NodeInformation.build(id = "node1", dependencies = setOf("node2", "node3"))
        val node2 = NodeInformation.build(id = "node2", dependencies = setOf("node1"))
        val node3 = NodeInformation.build(id = "node3", dependencies = setOf("node1"))

        // when
        val cycles = CycleAnalyzer.determineCycles(setOf(node1, node2, node3), false)

        // then
        assertThat(cycles).hasSize(2)
    }

    @Test
    fun `should group cycles per leaf`() {
        // given
        val node1 = NodeInformation.build(id = "node1", dependencies = setOf("node2", "node3"))
        val node2 = NodeInformation.build(id = "node2", dependencies = setOf("node1"))
        val node3 = NodeInformation.build(id = "node3", dependencies = setOf("node1"))
        val cycles = CycleAnalyzer.determineCycles(setOf(node1, node2, node3), false)

        // when
        val cyclicEdgesByLeaf = cycles.groupByLeafs()

        // then
        assertThat(cyclicEdgesByLeaf).hasSize(3)
        assertThat(cyclicEdgesByLeaf[node1.id]).isEqualTo(setOf("node2", "node3"))
        assertThat(cyclicEdgesByLeaf[node2.id]).isEqualTo(setOf("node1"))
        assertThat(cyclicEdgesByLeaf[node3.id]).isEqualTo(setOf("node1"))
    }
}
