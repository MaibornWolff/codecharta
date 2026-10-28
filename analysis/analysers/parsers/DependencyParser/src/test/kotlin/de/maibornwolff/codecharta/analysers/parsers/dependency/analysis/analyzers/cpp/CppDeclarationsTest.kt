package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.cpp

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class CppDeclarationsTest {
    private fun File.withFile(path: String, content: String): File {
        resolve(path).also { it.parentFile.mkdirs() }.writeText(content)
        return this
    }

    @Test
    fun `should see the classes the files of the include closure declare`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFile("speed.h", "struct Speed {};").withFile("creature.h", "#include \"speed.h\"\nstruct Creature {};")

        // Act
        val found = CppDeclarations.of(root).visibleNamesOf(listOf("creature.h")).resolve(listOf("Speed"), listOf("Creature"))

        // Assert
        assertThat(found).containsExactly("Speed")
    }

    @Test
    fun `should read no declarations from an included file that is no C or C++ file`(
        @TempDir root: File
    ) {
        // Arrange
        root
            .withFile(
                "creature_types.inc",
                "struct Speed {};"
            ).withFile("creature.h", "#include \"creature_types.inc\"\nstruct Creature {};")

        // Act
        val found = CppDeclarations.of(root).visibleNamesOf(listOf("creature.h")).resolve(listOf("Speed"), listOf("Creature"))

        // Assert
        assertThat(found).isNull()
    }

    @Test
    fun `should hand out the parse of the file's include closure for the same text`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFile("creature.h", "struct Creature {};")
        val declarations = CppDeclarations.of(root)
        declarations.visibleNamesOf(listOf("creature.h"))

        // Act
        val first = declarations.parseOf(listOf("creature.h"), "struct Creature {};")
        val second = declarations.parseOf(listOf("creature.h"), "struct Creature {};")

        // Assert
        assertThat(second).isSameAs(first)
        assertThat(first.declarations.map { it.name }).containsExactly("Creature")
    }

    @Test
    fun `should parse the given text when it differs from the file`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFile("creature.h", "﻿struct Creature {};")

        // Act
        val parse = CppDeclarations.of(root).parseOf(listOf("creature.h"), "struct Speed {};")

        // Assert
        assertThat(parse.declarations.map { it.name }).containsExactly("Speed")
    }
}
