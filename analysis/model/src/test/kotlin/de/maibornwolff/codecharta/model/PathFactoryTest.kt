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
import org.jetbrains.spek.api.Spek
import org.jetbrains.spek.api.dsl.describe
import org.jetbrains.spek.api.dsl.it
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class PathFactoryTest : Spek({

    describe("empty dir") {
        val emptyPath = PathFactory.fromFileSystemPath("")

        it("should be trivial path") {
            assertTrue(PathFactory.fromFileSystemPath("").isTrivial)
        }

        it("should be equal with slash path") {
            assertThat(emptyPath, matchesPath(PathFactory.fromFileSystemPath("/")))
        }
    }

    it("leading slash should devine same hierarchical position") {
        val pathsWithoutSlash = listOf(
                "file", "subdir/file", "subdir/subdir/file", "subdir/othersubdir/file"
        )

        for (path in pathsWithoutSlash) {
            assertThat(PathFactory.fromFileSystemPath(path), `is`(PathFactory.fromFileSystemPath("/$path")))
        }
    }

    describe("path without subdirs") {
        val filename = "leaf"
        val path = PathFactory.fromFileSystemPath(filename)

        it("should be leaf") {
            assertFalse(path.isTrivial)
            assertTrue(path.isSingle)
        }

        it("head should return filename") {
            assertThat(path.head, `is`(filename))
        }

        it("tail should be trivial") {
            assertTrue(path.tail.isTrivial)
        }
    }

    describe("path with subdir") {
        val path = PathFactory.fromFileSystemPath("subdir/filename")

        it("should not be leaf") {
            assertFalse(path.isTrivial)
            assertFalse(path.isSingle)
        }

        it("head should be subdir") {
            assertThat(path.head, `is`("subdir"))
        }

        it("tail should be file") {
            assertThat(path.tail, `is`(Path(listOf("filename"))))
        }
    }
})