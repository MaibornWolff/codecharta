package de.maibornwolff.codecharta.model

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class PathTest {

    @Nested
    @DisplayName("PathTest > trivial path")
    inner class TrivialPath {
        val trivialPath = Path.TRIVIAL

        @Test
        fun `should behave as expected`() {
            assertThat(trivialPath).isEqualTo(trivialPath)
            assertThat(trivialPath.concat(trivialPath)).isEqualTo(trivialPath)
            assertThat(trivialPath.isTrivial).isTrue
            assertThat(trivialPath.isSingle).isTrue
            assertThat(trivialPath.head).isEqualTo("")
            assertThat(trivialPath.tail.isTrivial).isTrue
        }
    }

    @Nested
    @DisplayName("PathTest > non-trivial path of length one")
    inner class NonTrivialPathLengthOne {
        val edgeName = "bla"
        val nonTrivialPath = Path(edgeName)

        @Test
        fun `should not be equal to trivial path`() {
            assertThat(Path.TRIVIAL).isNotEqualTo(nonTrivialPath)
            assertThat(nonTrivialPath).isNotEqualTo(Path.TRIVIAL)
        }

        @Test
        fun `should not be trivial but be single`() {
            assertThat(nonTrivialPath.isTrivial).isFalse
            assertThat(nonTrivialPath.isSingle).isTrue
        }

        @Test
        fun `should be equal to itself`() {
            assertThat(nonTrivialPath).isEqualTo(nonTrivialPath)
            assertThat(nonTrivialPath).isEqualTo(Path(edgeName))
        }

        @Test
        fun `should not be equal to another non-trivial path`() {
            val anotherNonTrivialPath = Path("blubb")
            assertThat(nonTrivialPath).isNotEqualTo(anotherNonTrivialPath)
        }

        @Test
        fun `concat with trivial path should return same path`() {
            assertThat(nonTrivialPath.concat(Path.TRIVIAL)).isEqualTo(nonTrivialPath)
            assertThat(Path.TRIVIAL.concat(nonTrivialPath)).isEqualTo(nonTrivialPath)
        }

        @Test
        fun `head should be name of single edge`() {
            assertThat(nonTrivialPath.head).isEqualTo(edgeName)
        }

        @Test
        fun `tail should be trivial`() {
            assertThat(nonTrivialPath.tail.isTrivial).isTrue
        }
    }

    @Nested
    @DisplayName("Path Test > non-trivial path of length two")
    inner class NonTrivialPathLengthTwo {
        val firstEdgeName = "first"
        val secondEdgeName = "second"
        val nonTrivialPath = Path(firstEdgeName, secondEdgeName)
        val firstPath = Path(nonTrivialPath.edgesList[0])
        val secondPath = Path(nonTrivialPath.edgesList[1])

        @Test
        fun `should not be equal to trivial path`() {
            assertThat(Path.TRIVIAL).isNotEqualTo(nonTrivialPath)
        }

        @Test
        fun `should not be trivial or single`() {
            assertThat(nonTrivialPath.isTrivial).isFalse
            assertThat(nonTrivialPath.isSingle).isFalse
        }

        @Test
        fun `should equal itself`() {
            assertThat(nonTrivialPath).isEqualTo(nonTrivialPath)
        }

        @Test
        fun `should equal concatenation of its parts`() {
            val concatenatedPath = firstPath.concat(secondPath)

            assertThat(nonTrivialPath).isEqualTo(concatenatedPath)
        }

        @Test
        fun `should not be equal to its parts`() {
            assertThat(nonTrivialPath).isNotEqualTo(firstPath)
            assertThat(nonTrivialPath).isNotEqualTo(secondPath)
        }

        @Test
        fun `head should be first edge name`() {
            assertThat(nonTrivialPath.head).isEqualTo(firstEdgeName)
        }

        @Test
        fun `tail should be second edge`() {
            assertThat(nonTrivialPath.tail).isEqualTo(secondPath)
        }
    }

    @Test
    fun `fitting edges from tail with should calculate correctly`() {
        val paths = listOf(
            Path(),
            Path("1"),
            Path("1", "2"),
            Path("1", "2", "3"),
            Path("a"),
            Path("1", "a"),
            Path("0", "1", "a"),
            Path("1", "2", "a"),
            Path("0", "1", "2", "a")
        )

        assertThat(paths.map { paths[0].fittingEdgesFromTailWith(it) })
            .isEqualTo(listOf(0, 0, 0, 0, 0, 0, 0, 0, 0))

        assertThat(paths.map { paths[4].fittingEdgesFromTailWith(it) })
            .isEqualTo(listOf(0, 0, 0, 0, 1, 1, 1, 1, 1))

        assertThat(paths.map { paths[5].fittingEdgesFromTailWith(it) })
            .isEqualTo(listOf(0, 0, 0, 0, 1, 2, 2, 1, 1))

        assertThat(paths.map { paths[7].fittingEdgesFromTailWith(it) })
            .isEqualTo(listOf(0, 0, 0, 0, 1, 1, 1, 3, 3))
    }
}
