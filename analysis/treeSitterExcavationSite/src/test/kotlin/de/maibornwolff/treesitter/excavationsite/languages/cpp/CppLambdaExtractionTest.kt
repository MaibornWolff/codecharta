package de.maibornwolff.treesitter.excavationsite.languages.cpp

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CppLambdaExtractionTest {
    @Test
    fun `should extract lambda capture by value`() {
        // Arrange
        val code = "auto lambda = [x]() { return x; };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("lambda", "x")
    }

    @Test
    fun `should extract lambda capture by reference`() {
        // Arrange
        val code = "auto lambda = [&y]() { y++; };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("lambda", "y")
    }

    @Test
    fun `should extract multiple lambda captures`() {
        // Arrange
        val code = "auto lambda = [x, &y, z]() { return x + y + z; };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("lambda", "x", "y", "z")
    }

    @Test
    fun `should extract lambda capture with initializer`() {
        // Arrange
        val code = "auto lambda = [ptr = std::move(value)]() { };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("lambda", "ptr")
    }

    @Test
    fun `should extract lambda parameters`() {
        // Arrange
        val code = "auto add = [](int x, int y) { return x + y; };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("add", "x", "y")
    }

    @Test
    fun `should extract generic lambda parameter`() {
        // Arrange
        val code = "auto process = [](auto&& item) { use(item); };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("process", "item")
    }

    @Test
    fun `should extract lambda with captures and parameters`() {
        // Arrange
        val code = "auto closure = [&state](int input) { state += input; };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("closure", "state", "input")
    }

    @Test
    fun `should extract lambda variable identifier`() {
        // Arrange
        val code = """
            auto handler = [](int x) { return x * 2; };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("handler", "x")
    }

    @Test
    fun `should handle default capture by value`() {
        // Arrange
        val code = "auto lambda = [=]() { return x + y; };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("lambda")
    }

    @Test
    fun `should handle default capture by reference`() {
        // Arrange
        val code = "auto lambda = [&]() { x++; };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("lambda")
    }

    @Test
    fun `should extract mixed capture with defaults`() {
        // Arrange
        val code = "auto lambda = [=, &specific]() { };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("lambda", "specific")
    }

    @Test
    fun `should extract capture with reference and copy`() {
        // Arrange
        val code = "auto lambda = [&, copied]() { };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("lambda", "copied")
    }

    @Test
    fun `should handle empty lambda capture`() {
        // Arrange
        val code = "auto lambda = []() { };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("lambda")
    }

    @Test
    fun `should extract nested lambda captures`() {
        // Arrange
        val code = """
            auto outer = [x]() {
                auto inner = [y]() { };
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("outer", "x", "inner", "y")
    }

    @Test
    fun `should extract lambda with mutable keyword`() {
        // Arrange
        val code = "auto counter = [count]() mutable { return ++count; };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("counter", "count")
    }

    @Test
    fun `should handle lambda with no parameters`() {
        // Arrange
        val code = "auto noParams = []() { return 42; };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("noParams")
    }

    @Test
    fun `should extract lambda with many parameters`() {
        // Arrange
        val code = "auto multiParam = [](int a, int b, int c, int d) { };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("multiParam", "a", "b", "c", "d")
    }

    @Test
    fun `should extract template lambda parameters`() {
        // Arrange
        val code = "auto generic = []<typename T>(T val) { };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("generic", "T", "val")
    }
}
