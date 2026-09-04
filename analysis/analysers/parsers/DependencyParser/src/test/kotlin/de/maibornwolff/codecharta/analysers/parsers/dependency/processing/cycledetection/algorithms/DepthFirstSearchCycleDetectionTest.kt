package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.algorithms

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class DepthFirstSearchCycleDetectionTest {
    @Test
    fun `detects cycle`() {
        // given
        val edges = listOf(NumberEdge(1, 2), NumberEdge(2, 3), NumberEdge(3, 1))
        val testee = DepthFirstSearchCycleDetection(edges, limitCycleLength = false)

        // when
        val cycles = testee.detectAllCycles()

        // then
        assertThat(cycles).hasSize(1)
        assertThat(cycles).containsExactly(edges)
    }

    @Test
    fun `returns empty set if there is no cycle`() {
        // given
        val edges = listOf(NumberEdge(1, 2))
        val testee = DepthFirstSearchCycleDetection(edges, limitCycleLength = false)

        // when
        val cycles = testee.detectAllCycles()

        // then
        assertThat(cycles).hasSize(0)
    }

    @Test
    fun `only returns edges which are part of the cycle`() {
        // given
        val cyclicEdges = listOf(NumberEdge(1, 2), NumberEdge(2, 1))
        val nonCyclicEdges = listOf(NumberEdge(3, 2))
        val testee = DepthFirstSearchCycleDetection(cyclicEdges + nonCyclicEdges, limitCycleLength = false)

        // when
        val cycles = testee.detectAllCycles()

        // then
        assertThat(cycles).containsExactly(cyclicEdges)
    }

    @Test
    fun `detects multiple cycles`() {
        // given
        val cycle1 = listOf(NumberEdge(1, 2), NumberEdge(2, 1))
        val cycle2 = listOf(NumberEdge(3, 4), NumberEdge(4, 3))
        val cyclicEdges = cycle1 + cycle2
        val testee = DepthFirstSearchCycleDetection(cyclicEdges, limitCycleLength = false)

        // when
        val cycles = testee.detectAllCycles()

        // then
        assertThat(cycles).hasSize(2)
        assertThat(cycles).containsExactlyInAnyOrder(cycle1, cycle2)
    }

    @Test
    fun `detects only cycles up to a maximum length`() {
        // given
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

        // when
        val cycles = testee.detectAllCycles()

        // then
        assertThat(cycles).isEmpty()
    }

    @Test
    fun `only detects one cycle`() {
        // given
        val cyclicEdges = listOf(NumberEdge(1, 2), NumberEdge(2, 1), NumberEdge(1, 3), NumberEdge(3, 2))
        val testee = DepthFirstSearchCycleDetection(cyclicEdges, limitCycleLength = false)

        // when
        val cycles = testee.detectSingleCycle()

        // then
        assertThat(cycles).hasSize(1)
    }
}
