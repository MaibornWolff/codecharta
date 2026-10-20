package de.maibornwolff.treesitter.excavationsite.languages.c

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CPreprocessorExtractionTest {
    @Test
    fun `should extract macro constant name`() {
        // Arrange
        val code = "#define MAX_SIZE 100"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("MAX_SIZE")
    }

    @Test
    fun `should extract macro function name`() {
        // Arrange
        val code = "#define MIN(a, b) ((a) < (b) ? (a) : (b))"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("MIN")
    }

    @Test
    fun `should extract variadic macro name`() {
        // Arrange
        val code = "#define LOG(fmt, ...) printf(fmt, ##__VA_ARGS__)"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("LOG")
    }

    @Test
    fun `should extract multiple macro definitions`() {
        // Arrange
        val code = """
            #define PI 3.14159
            #define E 2.71828
            #define SQUARE(x) ((x) * (x))
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("PI", "E", "SQUARE")
    }

    @Test
    fun `should extract macro with no value`() {
        // Arrange
        val code = "#define FEATURE_ENABLED"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("FEATURE_ENABLED")
    }

    @Test
    fun `should extract debug print macro`() {
        // Arrange
        val code = """#define DEBUG_PRINT(fmt, ...) printf(fmt, ##__VA_ARGS__)"""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("DEBUG_PRINT")
    }

    @Test
    fun `should extract ifdef condition`() {
        // Arrange
        val code = """
            #ifdef DEBUG
            int debugMode = 1;
            #endif
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("DEBUG", "debugMode")
    }

    @Test
    fun `should extract ifndef condition`() {
        // Arrange
        val code = """
            #ifndef HEADER_H
            #define HEADER_H
            #endif
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("HEADER_H", "HEADER_H")
    }

    @Test
    fun `should extract multiple ifdef conditions`() {
        // Arrange
        val code = """
            #ifdef FEATURE_A
            int featureA = 1;
            #endif
            #ifdef FEATURE_B
            int featureB = 1;
            #endif
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("FEATURE_A", "featureA", "FEATURE_B", "featureB")
    }

    @Test
    fun `should extract nested ifdef conditions`() {
        // Arrange
        val code = """
            #ifdef PLATFORM_LINUX
            #ifdef ARCH_X86
            int linuxX86 = 1;
            #endif
            #endif
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("PLATFORM_LINUX", "ARCH_X86", "linuxX86")
    }

    @Test
    fun `should extract macro with empty body`() {
        // Arrange
        val code = "#define EMPTY_MACRO"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("EMPTY_MACRO")
    }

    @Test
    fun `should extract macro with complex expression`() {
        // Arrange
        val code = "#define COMPLEX ((1 << 8) | (1 << 4) | 0x0F)"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("COMPLEX")
    }

    @Test
    fun `should extract macro with string value`() {
        // Arrange
        val code = """#define VERSION_STRING "1.0.0""""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert - macro name is extracted, but strings inside macro body are not separate nodes
        assertThat(result.identifiers).containsExactly("VERSION_STRING")
    }

    @Test
    fun `should extract macro function with no parameters`() {
        // Arrange
        val code = "#define GET_VALUE() (global_value)"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("GET_VALUE")
    }

    @Test
    fun `should extract macro function with many parameters`() {
        // Arrange
        val code = "#define MULTI(a, b, c, d, e) ((a) + (b) + (c) + (d) + (e))"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("MULTI")
    }

    @Test
    fun `should extract macro with line continuation`() {
        // Arrange
        val code = """
            #define LONG_MACRO(x) \
                do { \
                    process(x); \
                } while(0)
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("LONG_MACRO")
    }

    @Test
    fun `should handle underscore-prefixed macro names`() {
        // Arrange
        val code = """
            #define _INTERNAL_FLAG 1
            #define __DOUBLE_UNDERSCORE 2
            #define ___TRIPLE 3
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "_INTERNAL_FLAG",
            "__DOUBLE_UNDERSCORE",
            "___TRIPLE"
        )
    }

    @Test
    fun `should extract deeply nested ifdef conditions`() {
        // Arrange
        val code = """
            #ifdef LEVEL1
            #ifdef LEVEL2
            #ifdef LEVEL3
            int deep = 1;
            #endif
            #endif
            #endif
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("LEVEL1", "LEVEL2", "LEVEL3", "deep")
    }

    @Test
    fun `should extract ifdef with else branch`() {
        // Arrange
        val code = """
            #ifdef DEBUG
            int debug_val = 1;
            #else
            int release_val = 0;
            #endif
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("DEBUG", "debug_val", "release_val")
    }

    @Test
    fun `should extract ifndef for header guard pattern`() {
        // Arrange
        val code = """
            #ifndef _MY_HEADER_H_
            #define _MY_HEADER_H_
            int exported_function(void);
            #endif
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "_MY_HEADER_H_",
            "_MY_HEADER_H_",
            "exported_function"
        )
    }

    @Test
    fun `should handle empty ifdef block`() {
        // Arrange
        val code = """
            #ifdef UNUSED_FLAG
            #endif
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("UNUSED_FLAG")
    }
}
