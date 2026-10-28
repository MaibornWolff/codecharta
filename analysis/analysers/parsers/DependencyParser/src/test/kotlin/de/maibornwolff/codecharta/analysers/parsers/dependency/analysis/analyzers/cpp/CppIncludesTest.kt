package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.cpp

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class CppIncludesTest {
    private fun File.withFile(path: String, content: String = ""): File {
        resolve(path).also { it.parentFile.mkdirs() }.writeText(content)
        return this
    }

    private fun path(slashed: String) = slashed.split("/")

    @Test
    fun `should mean the file relative to the folder of the including file`(
        @TempDir root: File
    ) {
        // Arrange
        root
            .withFile("model/creature.h")
            .withFile("app/model/creature.h")
            .withFile("app/centaur.h", "#include \"../model/creature.h\"\n")

        // Act
        val closure = CppIncludes.of(root).closureOf(path("app/centaur.h"))

        // Assert
        assertThat(closure).containsExactlyInAnyOrder(path("app/centaur.h"), path("model/creature.h"))
    }

    @Test
    fun `should mean the nearest file whose path ends with the include path when none lies beside the including file`(
        @TempDir root: File
    ) {
        // Arrange
        root
            .withFile("liba/inc/config.h")
            .withFile("libb/inc/config.h")
            .withFile("liba/src/a.h", "#include \"config.h\"\n")

        // Act
        val closure = CppIncludes.of(root).closureOf(path("liba/src/a.h"))

        // Assert
        assertThat(closure).containsExactlyInAnyOrder(path("liba/src/a.h"), path("liba/inc/config.h"))
    }

    @Test
    fun `should match the ending of a path in whole segments only`(
        @TempDir root: File
    ) {
        // Arrange
        root
            .withFile("include/game/creature.h")
            .withFile("include/xgame/creature.h")
            .withFile("main/centaur.h", "#include \"game/creature.h\"\n")

        // Act
        val closure = CppIncludes.of(root).closureOf(path("main/centaur.h"))

        // Assert
        assertThat(closure).containsExactlyInAnyOrder(path("main/centaur.h"), path("include/game/creature.h"))
    }

    @Test
    fun `should take the first in path order of equally near files`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFile("b/config.h").withFile("a/config.h").withFile("main.c", "#include <config.h>\n")

        // Act
        val closure = CppIncludes.of(root).closureOf(path("main.c"))

        // Assert
        assertThat(closure).containsExactlyInAnyOrder(path("main.c"), path("a/config.h"))
    }

    @Test
    fun `should not look beside the including file for an angle-bracket include`(
        @TempDir root: File
    ) {
        // Arrange
        root
            .withFile("app/game/creature.h")
            .withFile("app/sub/game/creature.h")
            .withFile("app/sub/centaur.h", "#include <../game/creature.h>\n")

        // Act
        val closure = CppIncludes.of(root).closureOf(path("app/sub/centaur.h"))

        // Assert
        assertThat(closure).containsExactly(path("app/sub/centaur.h"))
    }

    @Test
    fun `should mean no file for a header the project does not hold`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFile("buffer.h", "#include <stdio.h>\n#include \"missing.h\"\n")

        // Act
        val closure = CppIncludes.of(root).closureOf(path("buffer.h"))

        // Assert
        assertThat(closure).containsExactly(path("buffer.h"))
    }

    @Test
    fun `should hold what the included files include, through a cycle of includes`(
        @TempDir root: File
    ) {
        // Arrange
        root
            .withFile("a.h", "#include \"b.h\"\n")
            .withFile("b.h", "  #  include \"c.h\" // the leaf\n")
            .withFile("c.h", "#include \"a.h\"\n")
            .withFile("d.h")

        // Act
        val closure = CppIncludes.of(root).closureOf(path("a.h"))

        // Assert
        assertThat(closure).containsExactlyInAnyOrder(path("a.h"), path("b.h"), path("c.h"))
    }

    @Test
    fun `should follow includes through a file of any extension`(
        @TempDir root: File
    ) {
        // Arrange
        root
            .withFile("creature_types.inc", "#include \"speed.h\"\n")
            .withFile("speed.h")
            .withFile("include/mylib/Widget", "#include \"widget.h\"\n")
            .withFile("include/mylib/widget.h")
            .withFile("creature.h", "#include \"creature_types.inc\"\n#include <mylib/Widget>\n")

        // Act
        val closure = CppIncludes.of(root).closureOf(path("creature.h"))

        // Assert
        assertThat(closure).containsExactlyInAnyOrder(
            path("creature.h"),
            path("creature_types.inc"),
            path("speed.h"),
            path("include/mylib/Widget"),
            path("include/mylib/widget.h")
        )
    }

    @Test
    fun `should read an include line continued with a backslash`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFile("dir/subdir/Repository.h").withFile("app.h", "#include \"dir/\\\n    subdir/Repository.h\"\n")

        // Act
        val closure = CppIncludes.of(root).closureOf(path("app.h"))

        // Assert
        assertThat(closure).containsExactlyInAnyOrder(path("app.h"), path("dir/subdir/Repository.h"))
    }
}
