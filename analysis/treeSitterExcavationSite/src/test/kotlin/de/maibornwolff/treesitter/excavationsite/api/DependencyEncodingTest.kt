package de.maibornwolff.treesitter.excavationsite.api

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class DependencyEncodingTest {
    @Test
    fun `should extract whole names from a file that starts with a byte order mark`() {
        // Arrange
        val byteOrderMark = "\uFEFF"
        val code = byteOrderMark + "using System.Text;\nnamespace Benchmarks;\nclass BenchmarkRunner : RunnerBase {}"

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.CSHARP)

        // Assert
        assertThat(result.packagePath).containsExactly("Benchmarks")
        assertThat(result.imports.map { it.path }).containsExactly(listOf("System", "Text"))
        assertThat(result.declarations.map { it.name }).containsExactly("BenchmarkRunner")
        assertThat(result.declarations.single().usedTypes.map { it.name }).containsExactly("RunnerBase")
    }

    @Test
    fun `should extract whole names after the noncharacters U+FFFE and U+FFFF`() {
        // Arrange
        val code = "class A { String range = \"\uFFFE-\uFFFF\"; }\nclass AfterTheRange extends RangeBase {}"

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.JAVA)

        // Assert
        assertThat(result.declarations.map { it.name }).containsExactly("A", "AfterTheRange")
        assertThat(result.declarations.last().usedTypes.map { it.name }).containsExactly("RangeBase")
    }

    @Test
    fun `should extract the includes on both sides of a form feed`() {
        // Arrange
        val formFeed = "\u000C"
        val code = "#include \"before.h\"\n$formFeed\n#include \"after.h\"\nclass Widget : public Base {};"

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.CPP)

        // Assert
        assertThat(result.imports.map { it.path }).containsExactly(listOf("before.h"), listOf("after.h"))
        assertThat(result.declarations.map { it.name }).containsExactly("Widget")
    }

    @Test
    fun `should extract the includes on both sides of a vertical tab and of a unit separator`() {
        // Arrange
        val verticalTab = "\u000B"
        val unitSeparator = "\u001F"
        val code = "#include \"first.h\"\n$verticalTab\n#include \"second.h\"\n$unitSeparator\n#include \"third.h\"\nclass Widget {};"

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.CPP)

        // Assert
        assertThat(result.imports.map { it.path }).containsExactly(listOf("first.h"), listOf("second.h"), listOf("third.h"))
        assertThat(result.declarations.map { it.name }).containsExactly("Widget")
    }

    @Test
    fun `should extract names after multi-byte characters unshifted`() {
        // Arrange
        val code = "// schließt 😀\nimport java.util.List;\nclass Größe extends Basis { List<After> 名前; }"

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.JAVA)

        // Assert
        assertThat(result.imports.map { it.path }).containsExactly(listOf("java", "util", "List"))
        assertThat(result.declarations.map { it.name }).containsExactly("Größe")
        assertThat(result.declarations.single().usedTypes.map { it.name }).containsExactly("Basis", "List")
    }

    @Test
    fun `should extract the declarations of a file with a lone surrogate instead of failing`() {
        // Arrange
        val loneSurrogate = "\uD83D"
        val code = "class A { String label = \"x${loneSurrogate}y\"; }\nclass AfterTheSurrogate extends SurrogateBase {}"

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.JAVA)

        // Assert
        assertThat(result.declarations.map { it.name }).containsExactly("A", "AfterTheSurrogate")
        assertThat(result.declarations.last().usedTypes.map { it.name }).containsExactly("SurrogateBase")
    }
}
