package de.maibornwolff.codecharta.model

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class PathFactoryTest {
    @Nested
    @DisplayName("PathFactoryTest > empty dir")
    inner class EmptyDir {
        val emptyPath = PathFactory.fromFileSystemPath("")

        @Test
        fun `should be trivial path`() {
            assertThat(PathFactory.fromFileSystemPath("").isTrivial).isTrue
        }

        @Test
        fun `should be equal with slash path`() {
            assertThat(emptyPath).isEqualTo(PathFactory.fromFileSystemPath("/"))
        }
    }

    @Nested
    @DisplayName("PathFactoryTest > paths with leading slash")
    inner class PathLeadingSlash {
        @Test
        fun `should produce same hierarchical position`() {
            val pathsWithoutSlash = listOf(
                "file",
                "subdir/file",
                "subdir/subdir/file",
                "subdir/othersubdir/file"
            )

            for (path in pathsWithoutSlash) {
                assertThat(PathFactory.fromFileSystemPath(path)).isEqualTo(PathFactory.fromFileSystemPath("/$path"))
            }
        }
    }

    @Nested
    @DisplayName("PathFactoryTest > path without subdirs")
    inner class PathWithoutSubdirs {
        val filename = "leaf"
        val path = PathFactory.fromFileSystemPath(filename)

        @Test
        fun `should be leaf`() {
            assertThat(path.isTrivial).isFalse
            assertThat(path.isSingle).isTrue
        }

        @Test
        fun `head should return filename`() {
            assertThat(path.head).isEqualTo(filename)
        }

        @Test
        fun `tail should be trivial`() {
            assertThat(path.tail.isTrivial).isTrue
        }
    }

    @Nested
    @DisplayName("PathFactoryTest > path with subdir")
    inner class PathWithSubdir {
        val path = PathFactory.fromFileSystemPath("subdir/filename")

        @Test
        fun `should not be leaf`() {
            assertThat(path.isTrivial).isFalse
            assertThat(path.isSingle).isFalse
        }

        @Test
        fun `head should be subdir`() {
            assertThat(path.head).isEqualTo("subdir")
        }

        @Test
        fun `tail should be file`() {
            assertThat(path.tail).isEqualTo(Path(listOf("filename")))
        }
    }
}
