package de.maibornwolff.codecharta.model

import de.maibornwolff.codecharta.model.PathMatcher.matchesPath
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.`is`
import org.hamcrest.Matchers.not
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class PathTest : Spek({

    describe("trivial path") {

        val trivialPath = Path.TRIVIAL

        it("should be equal to trivial path") {
            assertThat(trivialPath, matchesPath(trivialPath))
        }

        it("concat with trivial path should be trivial path") {
            assertThat(trivialPath.concat(trivialPath), matchesPath(trivialPath))
        }

        it("should be trivial") {
            assertTrue(trivialPath.isTrivial)
        }

        it("should be single") {
            assertTrue(trivialPath.isSingle)
        }

        it("head is empty String") {
            assertThat(trivialPath.head, `is`(""))
        }

        it("tail should be trivial") {
            assertTrue(trivialPath.tail.isTrivial)
        }
    }

    describe("non-trivial path of length one") {

        val edgeName = "bla"
        val nonTrivialPath = Path(edgeName)

        it("should not be equal to trivial path") {
            assertThat(Path.TRIVIAL, not(matchesPath(nonTrivialPath)))
            assertThat(nonTrivialPath, not(matchesPath(Path.TRIVIAL)))
        }

        it("should not be trivial") {
            assertFalse(nonTrivialPath.isTrivial)
        }

        it("should be single") {
            assertTrue(nonTrivialPath.isSingle)
        }

        it("should be equal to itself") {
            assertThat(nonTrivialPath, matchesPath(nonTrivialPath))
            assertThat(nonTrivialPath, matchesPath(Path(edgeName)))
        }

        it("should not be equal to another non-trivial path") {
            val anotherNonTrivialPath = Path("blubb")
            assertThat(nonTrivialPath, not(matchesPath(anotherNonTrivialPath)))
            assertThat(anotherNonTrivialPath, not(matchesPath(nonTrivialPath)))
        }

        it("concat with trivial path should return same path") {
            assertThat(nonTrivialPath.concat(Path.TRIVIAL), matchesPath(nonTrivialPath))
            assertThat(Path.TRIVIAL.concat(nonTrivialPath), matchesPath(nonTrivialPath))
        }

        it("head should be name of single edge") {
            assertThat(nonTrivialPath.head, `is`(edgeName))
        }

        it("tail should be trivial") {
            assertTrue(nonTrivialPath.tail.isTrivial)
        }
    }

    describe("non-trivial path of length two") {
        val firstEdgeName = "first"
        val secondEdgeName = "second"
        val nonTrivialPath = Path(firstEdgeName, secondEdgeName)
        val firstPath = Path(nonTrivialPath.edgesList[0])
        val secondPath = Path(nonTrivialPath.edgesList[1])

        it("should not be equal to trivial path") {
            assertThat(Path.TRIVIAL, not(matchesPath(nonTrivialPath)))
            assertThat(nonTrivialPath, not(matchesPath(Path.TRIVIAL)))
        }

        it("should not be trivial") {
            assertFalse(nonTrivialPath.isTrivial)
        }

        it("should not be single") {
            assertFalse(nonTrivialPath.isSingle)
        }

        it("should equal itself") {
            assertThat(nonTrivialPath, matchesPath(nonTrivialPath))
        }

        it("should equal concatination of its parts") {
            val concatinatedPath = firstPath.concat(secondPath)

            assertThat(nonTrivialPath, matchesPath(concatinatedPath))
        }

        it("should not be equal to its parts") {
            assertThat(nonTrivialPath, not(matchesPath(firstPath)))
            assertThat(nonTrivialPath, not(matchesPath(secondPath)))
        }

        it("head should be first edge name") {
            assertThat(nonTrivialPath.head, `is`(firstEdgeName))
        }

        it("tail should be second edge") {
            assertThat(nonTrivialPath.tail, matchesPath(secondPath))
        }
    }

    describe("fittingEdgesFromTailWith") {

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

        describe("for trivial path") {
            it("should calculate fitting edges") {
                assertThat(
                        paths.map { paths[0].fittingEdgesFromTailWith(it) },
                        `is`(listOf(0, 0, 0, 0, 0, 0, 0, 0, 0))
                )
            }
        }

        describe("for leaf") {
            it("should calculate fitting edges") {
                assertThat(
                        paths.map { paths[4].fittingEdgesFromTailWith(it) },
                        `is`(listOf(0, 0, 0, 0, 1, 1, 1, 1, 1))
                )
            }
        }

        describe("for path of length 2") {
            it("should calculate fitting edges") {
                assertThat(
                        paths.map { paths[5].fittingEdgesFromTailWith(it) },
                        `is`(listOf(0, 0, 0, 0, 1, 2, 2, 1, 1))
                )
            }
        }

        describe("for path of length 3") {
            it("should calculate fitting edges") {
                assertThat(
                        paths.map { paths[7].fittingEdgesFromTailWith(it) },
                        `is`(listOf(0, 0, 0, 0, 1, 1, 1, 3, 3))
                )
            }
        }
    }
})