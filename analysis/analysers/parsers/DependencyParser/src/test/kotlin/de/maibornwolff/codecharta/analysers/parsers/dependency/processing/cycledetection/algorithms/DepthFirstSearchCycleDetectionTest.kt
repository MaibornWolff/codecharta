package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.algorithms

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Timeout

class DepthFirstSearchCycleDetectionTest {
    @Test
    fun `should detect a cycle`() {
        // Arrange
        val edges = listOf(NumberEdge(1, 2), NumberEdge(2, 3), NumberEdge(3, 1))
        val testee = DepthFirstSearchCycleDetection(edges, limitCycleLength = false)

        // Act
        val cycles = testee.detectAllCycles()

        // Assert
        assertThat(cycles).hasSize(1)
        assertThat(cycles).containsExactly(edges)
    }

    @Test
    fun `should return an empty set when there is no cycle`() {
        // Arrange
        val edges = listOf(NumberEdge(1, 2))
        val testee = DepthFirstSearchCycleDetection(edges, limitCycleLength = false)

        // Act
        val cycles = testee.detectAllCycles()

        // Assert
        assertThat(cycles).hasSize(0)
    }

    @Test
    fun `should return only the edges that are part of the cycle`() {
        // Arrange
        val cyclicEdges = listOf(NumberEdge(1, 2), NumberEdge(2, 1))
        val nonCyclicEdges = listOf(NumberEdge(3, 2))
        val testee = DepthFirstSearchCycleDetection(cyclicEdges + nonCyclicEdges, limitCycleLength = false)

        // Act
        val cycles = testee.detectAllCycles()

        // Assert
        assertThat(cycles).containsExactly(cyclicEdges)
    }

    @Test
    fun `should detect multiple cycles`() {
        // Arrange
        val cycle1 = listOf(NumberEdge(1, 2), NumberEdge(2, 1))
        val cycle2 = listOf(NumberEdge(3, 4), NumberEdge(4, 3))
        val cyclicEdges = cycle1 + cycle2
        val testee = DepthFirstSearchCycleDetection(cyclicEdges, limitCycleLength = false)

        // Act
        val cycles = testee.detectAllCycles()

        // Assert
        assertThat(cycles).hasSize(2)
        assertThat(cycles).containsExactlyInAnyOrder(cycle1, cycle2)
    }

    @Test
    fun `should detect only cycles up to a maximum length`() {
        // Arrange
        val cycleLongerThanMaximumLength = listOf(
            NumberEdge(1, 2),
            NumberEdge(2, 3),
            NumberEdge(3, 4),
            NumberEdge(4, 5),
            NumberEdge(5, 6),
            NumberEdge(6, 7),
            NumberEdge(7, 8),
            NumberEdge(8, 9),
            NumberEdge(9, 10),
            NumberEdge(10, 11),
            NumberEdge(11, 12),
            NumberEdge(12, 1)
        )
        val testee = DepthFirstSearchCycleDetection(cycleLongerThanMaximumLength, limitCycleLength = true)

        // Act
        val cycles = testee.detectAllCycles()

        // Assert
        assertThat(cycles).isEmpty()
    }

    @Test
    fun `should detect only one cycle`() {
        // Arrange
        val cyclicEdges = listOf(NumberEdge(1, 2), NumberEdge(2, 1), NumberEdge(1, 3), NumberEdge(3, 2))
        val testee = DepthFirstSearchCycleDetection(cyclicEdges, limitCycleLength = false)

        // Act
        val cycles = testee.detectSingleCycle()

        // Assert
        assertThat(cycles).hasSize(1)
    }

    @Test
    @Timeout(value = SEARCH_TIMEOUT_SECONDS, threadMode = Timeout.ThreadMode.SEPARATE_THREAD)
    fun `should find no single cycle in a dense graph without one`() {
        // Arrange
        val nodeCount = 40
        val edgesToEveryLowerNode = (1 until nodeCount).flatMap { from -> (0 until from).map { to -> NumberEdge(from, to) } }
        val testee = DepthFirstSearchCycleDetection(edgesToEveryLowerNode, limitCycleLength = false)

        // Act
        val cycles = testee.detectSingleCycle()

        // Assert
        assertThat(cycles).isEmpty()
    }

    @Test
    fun `should find the single cycle of a chain too long for a recursive search`() {
        // Arrange
        val nodeCount = 50_000
        val chainBackToItsStart = (0 until nodeCount).map { from -> NumberEdge(from, (from + 1) % nodeCount) }
        val testee = DepthFirstSearchCycleDetection(chainBackToItsStart, limitCycleLength = false)

        // Act
        val cycles = testee.detectSingleCycle()

        // Assert
        assertThat(cycles).containsExactly(chainBackToItsStart)
    }

    companion object {
        private const val SEARCH_TIMEOUT_SECONDS = 10L
    }
}
