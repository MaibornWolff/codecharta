package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.algorithms

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class DepthFirstSearchCycleDetectionTest {
    @Test
    fun `should detect a cycle`() {
        // Arrange
        val edges = listOf(NumberEdge(1, 2), NumberEdge(2, 3), NumberEdge(3, 1))
        val testee = DepthFirstSearchCycleDetection(edges)

        // Act
        val cycles = testee.detectSingleCycle()

        // Assert
        assertThat(cycles).hasSize(1)
        assertThat(cycles).containsExactly(edges)
    }

    @Test
    fun `should return an empty set when there is no cycle`() {
        // Arrange
        val edges = listOf(NumberEdge(1, 2))
        val testee = DepthFirstSearchCycleDetection(edges)

        // Act
        val cycles = testee.detectSingleCycle()

        // Assert
        assertThat(cycles).hasSize(0)
    }

    @Test
    fun `should return only the edges that are part of the cycle`() {
        // Arrange
        val cyclicEdges = listOf(NumberEdge(1, 2), NumberEdge(2, 1))
        val nonCyclicEdges = listOf(NumberEdge(3, 2))
        val testee = DepthFirstSearchCycleDetection(cyclicEdges + nonCyclicEdges)

        // Act
        val cycles = testee.detectSingleCycle()

        // Assert
        assertThat(cycles).containsExactly(cyclicEdges)
    }

    @Test
    fun `should detect multiple cycles`() {
        // Arrange
        val cycle1 = listOf(NumberEdge(1, 2), NumberEdge(2, 1))
        val cycle2 = listOf(NumberEdge(3, 4), NumberEdge(4, 3))
        val cyclicEdges = cycle1 + cycle2
        val testee = DepthFirstSearchCycleDetection(cyclicEdges)

        // Act
        val cycles = testee.detectSingleCycle()

        // Assert
        assertThat(cycles).hasSize(2)
        assertThat(cycles).containsExactlyInAnyOrder(cycle1, cycle2)
    }

    @Test
    fun `should detect only one cycle`() {
        // Arrange
        val cyclicEdges = listOf(NumberEdge(1, 2), NumberEdge(2, 1), NumberEdge(1, 3), NumberEdge(3, 2))
        val testee = DepthFirstSearchCycleDetection(cyclicEdges)

        // Act
        val cycles = testee.detectSingleCycle()

        // Assert
        assertThat(cycles).hasSize(1)
    }
}
