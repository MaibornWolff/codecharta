package de.maibornwolff.treesitter.excavationsite.languages.c

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CTypedefAndInitializerExtractionTest {
    @Test
    fun `should extract typedef function pointer name`() {
        // Arrange
        val code = "typedef int (*Comparator)(const void*, const void*);"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert - typedef name extracted without parameters (no named params)
        assertThat(result.identifiers).containsExactly("Comparator")
    }

    @Test
    fun `should extract typedef void function pointer name`() {
        // Arrange
        val code = "typedef void (*Handler)(int, const char*);"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert - typedef name extracted without parameters (no named params)
        assertThat(result.identifiers).containsExactly("Handler")
    }

    @Test
    fun `should extract typedef callback function pointer with named params`() {
        // Arrange
        val code = "typedef int (*Callback)(void* context, int event);"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert - includes typedef name and parameter names
        assertThat(result.identifiers).containsExactly("Callback", "context", "event")
    }

    @Test
    fun `should extract typedef pointer to array`() {
        // Arrange
        val code = "typedef int (*ArrayPtr)[10];"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("ArrayPtr")
    }

    @Test
    fun `should extract designated initializer field names`() {
        // Arrange
        val code = """
            struct Point p = { .x = 10, .y = 20 };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert - variable name comes before type in extraction order
        assertThat(result.identifiers).containsExactly("p", "Point", "x", "y")
    }

    @Test
    fun `should extract designated initializer with single field`() {
        // Arrange
        val code = """
            struct Config cfg = { .timeout = 30 };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert - variable name comes before type in extraction order
        assertThat(result.identifiers).containsExactly("cfg", "Config", "timeout")
    }

    @Test
    fun `should extract designated initializer with many fields`() {
        // Arrange
        val code = """
            struct Rectangle rect = { .x = 0, .y = 0, .width = 100, .height = 50 };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert - variable name comes before type in extraction order
        assertThat(result.identifiers).containsExactly("rect", "Rectangle", "x", "y", "width", "height")
    }

    @Test
    fun `should extract nested struct designated initializers`() {
        // Arrange
        val code = """
            struct Circle circle = { .center = { .x = 5, .y = 5 }, .radius = 10 };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert - variable name comes before type in extraction order
        assertThat(result.identifiers).containsExactly("circle", "Circle", "center", "x", "y", "radius")
    }

    @Test
    fun `should handle mixed designated and positional initializers`() {
        // Arrange
        val code = """
            struct Mix m = { 1, .named = 2, 3 };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("m", "Mix", "named")
    }

    @Test
    fun `should handle array with designated initializers`() {
        // Arrange
        val code = """
            int arr[10] = { [0] = 1, [5] = 2, [9] = 3 };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert - array index designators don't have field names
        assertThat(result.identifiers).containsExactly("arr")
    }

    @Test
    fun `should handle deeply nested designated initializers`() {
        // Arrange
        val code = """
            struct Outer o = {
                .inner = {
                    .deep = {
                        .value = 42
                    }
                }
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("o", "Outer", "inner", "deep", "value")
    }

    @Test
    fun `should handle empty struct initializer`() {
        // Arrange
        val code = "struct Empty e = {};"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("e", "Empty")
    }

    @Test
    fun `should handle designated initializer with string`() {
        // Arrange
        val code = """
            struct Config cfg = { .name = "test", .id = 1 };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("cfg", "Config", "name", "id")
        assertThat(result.strings).containsExactly("test")
    }

    @Test
    fun `should extract typedef of pointer to function returning pointer`() {
        // Arrange
        val code = "typedef char* (*StringFactory)(void);"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("StringFactory")
    }

    @Test
    fun `should extract typedef of array`() {
        // Arrange
        val code = "typedef int IntArray[100];"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("IntArray")
    }

    @Test
    fun `should extract typedef of pointer to array`() {
        // Arrange
        val code = "typedef int (*PtrToArray)[10];"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("PtrToArray")
    }

    @Test
    fun `should extract multiple typedefs in sequence`() {
        // Arrange
        val code = """
            typedef unsigned char byte;
            typedef unsigned short word;
            typedef unsigned int dword;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("byte", "word", "dword")
    }

    @Test
    fun `should extract typedef with const qualifier`() {
        // Arrange
        val code = "typedef const char* ConstString;"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("ConstString")
    }
}
