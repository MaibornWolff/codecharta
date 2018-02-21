/*
 * Copyright (c) 2017, MaibornWolff GmbH
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * Neither the name of  nor the names of its contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

package de.maibornwolff.codecharta.model

import de.maibornwolff.codecharta.model.PathMatcher.matchesPath
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.`is`
import org.hamcrest.Matchers.not
import org.jetbrains.spek.api.Spek
import org.jetbrains.spek.api.dsl.describe
import org.jetbrains.spek.api.dsl.it
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