package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.cpp

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DeclaringCopy
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FilePath
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class CppCopyRulesTest {
    private fun File.withFile(path: String, content: String = ""): File {
        resolve(path).also { it.parentFile.mkdirs() }.writeText(content)
        return this
    }

    private fun file(slashed: String) = FilePath(slashed.split("/"))

    private fun copies(vararg files: String) = files.map { DeclaringCopy(file(it), isFileScoped = false) }

    @Test
    fun `should point at the copy the include closure of the using file holds rather than the nearest`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFile("far/config.hpp").withFile("app/config.hpp").withFile("app/app.hpp", "#include \"../far/config.hpp\"\n")

        // Act
        val files = CppCopyRules(CppIncludes.of(root)).filesFor(copies("app/config.hpp", "far/config.hpp"), file("app/app.hpp"))

        // Assert
        assertThat(files).containsExactly(file("far/config.hpp"))
    }

    @Test
    fun `should point at the first copy in include order when the closure holds several`(
        @TempDir root: File
    ) {
        // Arrange
        root
            .withFile("a/config.hpp")
            .withFile("b/config.hpp")
            .withFile("b/wrapper.hpp", "#include \"config.hpp\"\n")
            .withFile("app.hpp", "#include \"b/wrapper.hpp\"\n#include \"a/config.hpp\"\n")

        // Act
        val files = CppCopyRules(CppIncludes.of(root)).filesFor(copies("a/config.hpp", "b/config.hpp"), file("app.hpp"))

        // Assert
        assertThat(files).containsExactly(file("b/config.hpp"))
    }

    @Test
    fun `should point at the nearest copy when the closure holds none`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFile("a/roost.h").withFile("b/roost.h").withFile("a/nest.h")

        // Act
        val files = CppCopyRules(CppIncludes.of(root)).filesFor(copies("b/roost.h", "a/roost.h"), file("a/nest.h"))

        // Assert
        assertThat(files).containsExactly(file("a/roost.h"))
    }

    @Test
    fun `should point at the nearest copy without an analysis root`() {
        // Act
        val files = CppCopyRules(null).filesFor(copies("b/roost.h", "a/roost.h"), file("a/nest.h"))

        // Assert
        assertThat(files).containsExactly(file("a/roost.h"))
    }

    @Test
    fun `should point at the class body rather than the implementation part of the using file`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFile("Creature.hpp").withFile("Creature.cpp", "#include \"Creature.hpp\"\n")
        val copies =
            listOf(DeclaringCopy(file("Creature.cpp"), isFileScoped = true), DeclaringCopy(file("Creature.hpp"), isFileScoped = false))

        // Act
        val files = CppCopyRules(CppIncludes.of(root)).filesFor(copies, file("Creature.cpp"))

        // Assert
        assertThat(files).containsExactly(file("Creature.hpp"))
    }
}
