package de.maibornwolff.codecharta.model

import de.maibornwolff.codecharta.model.PathMatcher.matchesPath
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.`is`
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe
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

    describe("paths with leading slash") {
        it("should produce same hierarchical position") {
            val pathsWithoutSlash = listOf(
                    "file", "subdir/file", "subdir/subdir/file", "subdir/othersubdir/file"
            )

            for (path in pathsWithoutSlash) {
                assertThat(PathFactory.fromFileSystemPath(path), `is`(PathFactory.fromFileSystemPath("/$path")))
            }
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