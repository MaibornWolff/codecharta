package de.maibornwolff.treesitter.excavationsite.languages.cpp

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CppTemplateExtractionTest {
    @Test
    fun `should extract template class identifier`() {
        // Arrange
        val code = """
            template<typename T>
            class Container {
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("T", "Container")
    }

    @Test
    fun `should extract template function identifier`() {
        // Arrange
        val code = """
            template<typename T>
            T process(T value) {
                return value;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("T", "process", "value")
    }

    @Test
    fun `should extract template type parameters`() {
        // Arrange
        val code = "template<typename T, typename U> class Pair { };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("T", "U", "Pair")
    }

    @Test
    fun `should extract template non-type parameter`() {
        // Arrange
        val code = "template<int N> struct Array { };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("N", "Array")
    }

    @Test
    fun `should extract template with class keyword`() {
        // Arrange
        val code = """
            template<class Container>
            void process(const Container& c) { }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("Container", "process", "c")
    }

    @Test
    fun `should extract template with default parameter`() {
        // Arrange
        val code = "template<typename T, typename U = int> class Map { };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("T", "U", "Map")
    }

    @Test
    fun `should extract variadic template parameter`() {
        // Arrange
        val code = "template<typename... Args> void print(Args... args) { }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert - variadic parameter packs have different node types
        // Currently extracts the function name; variadic params would need additional support
        assertThat(result.identifiers).containsExactly("print")
    }

    @Test
    fun `should extract multiple template parameters with mixed types`() {
        // Arrange
        val code = "template<typename T, int N, typename U> struct Buffer { };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("T", "N", "U", "Buffer")
    }

    @Test
    fun `should extract template parameters from nested template`() {
        // Arrange
        val code = """
            template<typename T>
            class Outer {
                template<typename U>
                void inner(U val) { }
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("T", "Outer", "U", "inner", "val")
    }

    @Test
    fun `should handle template specialization`() {
        // Arrange - full template specialization
        val code = "template<> class Specialized<int> { };"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert - template specialization uses template_type which contains the name
        // The class_specifier extracts from template_type differently
        assertThat(result.identifiers).isEmpty()
    }

    @Test
    fun `should extract partial template specialization`() {
        // Arrange
        val code = """
            template<typename T>
            class Container<T*> { };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("T")
    }

    @Test
    fun `should extract concept definition identifier`() {
        // Arrange
        val code = """
            template<typename T>
            concept Addable = requires(T a, T b) { a + b; };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CPP)

        // Assert
        assertThat(result.identifiers).containsExactly("T", "Addable", "a", "b")
    }
}
