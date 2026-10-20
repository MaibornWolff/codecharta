package de.maibornwolff.treesitter.excavationsite.languages.c

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CExtractionTest {
    @Test
    fun `should correctly categorize extracted items by context`() {
        // Arrange
        val code = """
            // Process the order
            struct Order {
                int id;
            };

            int process_order(char* msg) {
                return 0;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("Order", "id", "process_order", "msg")
        assertThat(result.comments).containsExactly("Process the order")
    }

    @Test
    fun `should provide access via extractedTexts list`() {
        // Arrange
        val code = """
            // Comment
            int foo;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.extractedTexts.map { it.context }).containsExactly(
            ExtractionContext.COMMENT,
            ExtractionContext.IDENTIFIER
        )
    }

    @Test
    fun `should report extraction is supported for C`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.C)).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".c")).isTrue()
    }

    @Test
    fun `should return C in supported languages`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.C)).isTrue()
    }

    @Test
    fun `should return c in supported extensions`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(".c")).isTrue()
    }

    @Test
    fun `should extract from complex header file`() {
        // Arrange
        val code = """
            #ifndef MY_HEADER_H
            #define MY_HEADER_H

            #define MAX_ITEMS 100
            #define CLAMP(x, lo, hi) ((x) < (lo) ? (lo) : ((x) > (hi) ? (hi) : (x)))

            typedef struct {
                int id;
                char name[64];
            } Item;

            typedef int (*ItemComparator)(const Item*, const Item*);

            void process_items(Item* items, int count);

            #endif
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "MY_HEADER_H",
            "MY_HEADER_H",
            "MAX_ITEMS",
            "CLAMP",
            "Item",
            "id",
            "name",
            "ItemComparator",
            "process_items",
            "items",
            "count"
        )
    }

    @Test
    fun `should extract from function with goto cleanup pattern`() {
        // Arrange
        val code = """
            int initialize_resources(int count) {
                int *buffer = NULL;
                int result = 0;

                buffer = malloc(count * sizeof(int));
                if (!buffer) goto cleanup;

                // ... process ...
                result = 1;

                cleanup:
                    free(buffer);
                    return result;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "initialize_resources",
            "count",
            "buffer",
            "result",
            "cleanup"
        )
    }

    @Test
    fun `should extract from struct with designated initializers in function`() {
        // Arrange
        val code = """
            struct Point {
                int x;
                int y;
            };

            struct Point create_point(int px, int py) {
                struct Point p = { .x = px, .y = py };
                return p;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert - includes struct definition, return type, params, local var type, initializer fields
        assertThat(result.identifiers).containsExactly(
            "Point",
            "x",
            "y",
            "create_point",
            "Point",
            "px",
            "py",
            "p",
            "Point",
            "x",
            "y"
        )
    }

    @Test
    fun `should extract from platform-specific code`() {
        // Arrange
        val code = """
            #ifdef _WIN32
            #define PATH_SEPARATOR '\\'
            int platform_id = 1;
            #endif

            #ifdef __linux__
            #define PATH_SEPARATOR '/'
            int platform_id = 2;
            #endif
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "_WIN32",
            "PATH_SEPARATOR",
            "platform_id",
            "__linux__",
            "PATH_SEPARATOR",
            "platform_id"
        )
    }

    @Test
    fun `should extract extern function declaration`() {
        // Arrange
        val code = "extern void externalFunction(int param);"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("externalFunction", "param")
    }

    @Test
    fun `should extract const static variable`() {
        // Arrange
        val code = "static const char* MESSAGE = \"hello\";"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("MESSAGE")
    }

    @Test
    fun `should extract volatile variable`() {
        // Arrange
        val code = "volatile int interrupt_flag;"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("interrupt_flag")
    }

    @Test
    fun `should handle complex typedef with struct`() {
        // Arrange
        val code = """
            typedef struct Node {
                int value;
                struct Node* next;
            } Node;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert - extracts: outer struct name, inner struct reference, fields, typedef name
        assertThat(result.identifiers).containsExactly("Node", "Node", "value", "next", "Node")
    }

    @Test
    fun `should handle file with only preprocessor directives`() {
        // Arrange
        val code = """
            #ifndef GUARD
            #define GUARD
            #define VALUE 42
            #endif
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("GUARD", "GUARD", "VALUE")
    }

    @Test
    fun `should handle error handling pattern with goto`() {
        // Arrange
        val code = """
            int init(void) {
                int *a = NULL, *b = NULL, *c = NULL;

                a = malloc(sizeof(int));
                if (!a) goto err_a;

                b = malloc(sizeof(int));
                if (!b) goto err_b;

                c = malloc(sizeof(int));
                if (!c) goto err_c;

                return 0;

            err_c:
                free(b);
            err_b:
                free(a);
            err_a:
                return -1;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "init",
            "a",
            "b",
            "c",
            "err_c",
            "err_b",
            "err_a"
        )
    }

    @Test
    fun `should handle complex macro and struct combination`() {
        // Arrange
        val code = """
            #define DECLARE_STRUCT(name) \
                struct name { int value; }

            #ifdef USE_CUSTOM
            DECLARE_STRUCT(Custom);
            #else
            struct Default { int value; };
            #endif
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "DECLARE_STRUCT",
            "USE_CUSTOM",
            "Default",
            "value"
        )
    }
}
