package de.maibornwolff.treesitter.excavationsite.languages.c

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CExtractionTest {
    // === Identifier Extraction Tests ===

    @Test
    fun `should extract function definition identifier`() {
        // Arrange
        val code = """
            void process_order() {
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("process_order")
    }

    @Test
    fun `should extract function with return type and parameters`() {
        // Arrange
        val code = """
            int calculate_total(int count, float price) {
                return count * price;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("calculate_total", "count", "price")
    }

    @Test
    fun `should extract simple variable declaration`() {
        // Arrange
        val code = """
            int order_count;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("order_count")
    }

    @Test
    fun `should extract initialized variable declaration`() {
        // Arrange
        val code = """
            int order_count = 10;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("order_count")
    }

    @Test
    fun `should extract pointer variable declaration`() {
        // Arrange
        val code = """
            int *order_ptr;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("order_ptr")
    }

    @Test
    fun `should extract double pointer variable declaration`() {
        // Arrange
        val code = """
            char **string_array;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("string_array")
    }

    @Test
    fun `should extract array variable declaration`() {
        // Arrange
        val code = """
            int order_ids[100];
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("order_ids")
    }

    @Test
    fun `should extract multidimensional array declaration`() {
        // Arrange
        val code = """
            int matrix[10][20];
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("matrix")
    }

    @Test
    fun `should extract struct specifier identifier`() {
        // Arrange
        val code = """
            struct User {
                int id;
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("User", "id")
    }

    @Test
    fun `should extract struct field identifiers`() {
        // Arrange
        val code = """
            struct Order {
                int order_id;
                char* customer_name;
                float total_amount;
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "Order",
            "order_id",
            "customer_name",
            "total_amount"
        )
    }

    @Test
    fun `should extract enum specifier identifier`() {
        // Arrange
        val code = """
            enum Status {
                PENDING,
                ACTIVE
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("Status", "PENDING", "ACTIVE")
    }

    @Test
    fun `should extract enumerator identifiers`() {
        // Arrange
        val code = """
            enum OrderStatus {
                PENDING,
                PROCESSING,
                SHIPPED,
                DELIVERED
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "OrderStatus",
            "PENDING",
            "PROCESSING",
            "SHIPPED",
            "DELIVERED"
        )
    }

    @Test
    fun `should extract union specifier identifier`() {
        // Arrange
        val code = """
            union Data {
                int i;
                float f;
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("Data", "i", "f")
    }

    @Test
    fun `should extract union field identifiers`() {
        // Arrange
        val code = """
            union Value {
                int int_value;
                float float_value;
                char* string_value;
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "Value",
            "int_value",
            "float_value",
            "string_value"
        )
    }

    @Test
    fun `should extract parameter identifiers`() {
        // Arrange
        val code = """
            void process(int order_id, char* customer_name) {
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("process", "order_id", "customer_name")
    }

    @Test
    fun `should extract typedef identifier`() {
        // Arrange
        val code = """
            typedef int UserId;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("UserId")
    }

    @Test
    fun `should extract typedef struct identifier`() {
        // Arrange
        val code = """
            typedef struct {
                int x;
                int y;
            } Point;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("Point", "x", "y")
    }

    @Test
    fun `should extract static variable declaration`() {
        // Arrange
        val code = """
            static int instance_count = 0;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("instance_count")
    }

    @Test
    fun `should extract extern variable declaration`() {
        // Arrange
        val code = """
            extern int global_counter;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("global_counter")
    }

    @Test
    fun `should handle empty source code`() {
        // Arrange
        val code = ""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).isEmpty()
        assertThat(result.comments).isEmpty()
        assertThat(result.strings).isEmpty()
    }

    @Test
    fun `should handle anonymous struct`() {
        // Arrange - anonymous struct, only variable name extracted
        val code = """
            struct { int x; } point;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("point", "x")
    }

    // === Comment Extraction Tests ===

    @Test
    fun `should extract single line comment`() {
        // Arrange
        val code = """
            // This is a comment
            int x;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.comments).hasSize(1)
        assertThat(result.comments[0]).isEqualTo("This is a comment")
    }

    @Test
    fun `should extract block comment`() {
        // Arrange
        val code = """
            /* This is a block comment */
            int x;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.comments).hasSize(1)
        assertThat(result.comments[0]).isEqualTo("This is a block comment")
    }

    @Test
    fun `should extract multiline block comment`() {
        // Arrange
        val code = """
            /*
             * This is a multiline
             * block comment
             */
            int x;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.comments).hasSize(1)
        assertThat(result.comments[0]).isEqualTo("This is a multiline\nblock comment")
    }

    @Test
    fun `should extract doc comment`() {
        // Arrange
        val code = """
            /**
             * Calculate the total price.
             * @param count Number of items
             * @param price Price per item
             */
            int calculate(int count, int price) {
                return count * price;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.comments).hasSize(1)
        assertThat(result.comments[0]).isEqualTo("Calculate the total price.\n@param count Number of items\n@param price Price per item")
    }

    // === String Extraction Tests ===

    @Test
    fun `should extract string literal`() {
        // Arrange
        val code = """
            int main() {
                char* message = "Hello World";
                return 0;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.strings).containsExactly("Hello World")
    }

    @Test
    fun `should extract multiple strings`() {
        // Arrange
        val code = """
            int main() {
                char* first = "Hello";
                char* second = "World";
                return 0;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.strings).containsExactly("Hello", "World")
    }

    @Test
    fun `should extract char literal`() {
        // Arrange
        val code = """
            int main() {
                char c = 'A';
                return 0;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.strings).containsExactly("A")
    }

    // === Combined Tests ===

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

    // === API Tests ===

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

    // === Macro Extraction Tests ===

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

    // === Preprocessor Conditional Tests ===

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

    // === Goto Label Tests ===

    @Test
    fun `should extract goto label`() {
        // Arrange
        val code = """
            void process() {
                start:
                    goto cleanup;
                cleanup:
                    return;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("process", "start", "cleanup")
    }

    @Test
    fun `should extract single label in function`() {
        // Arrange
        val code = """
            void retry_operation() {
                retry:
                    int x = 0;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("retry_operation", "retry", "x")
    }

    @Test
    fun `should extract multiple labels in function`() {
        // Arrange
        val code = """
            int state_machine(int input) {
                state_a:
                    if (input == 0) goto state_b;
                    return 0;
                state_b:
                    if (input == 1) goto state_c;
                    return 1;
                state_c:
                    return 2;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("state_machine", "input", "state_a", "state_b", "state_c")
    }

    // === Multiple Declarators Tests ===

    @Test
    fun `should extract all declarators from multi-variable declaration`() {
        // Arrange
        val code = "int a, b, c;"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("a", "b", "c")
    }

    @Test
    fun `should extract all declarators with initializers`() {
        // Arrange
        val code = "int x = 1, y = 2, z = 3;"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("x", "y", "z")
    }

    @Test
    fun `should extract mixed initialized and uninitialized declarators`() {
        // Arrange
        val code = "int a, b = 10, c;"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("a", "b", "c")
    }

    @Test
    fun `should extract pointer and non-pointer declarators`() {
        // Arrange
        val code = "char *p, **pp, arr[10];"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("p", "pp", "arr")
    }

    @Test
    fun `should extract multiple pointer declarators`() {
        // Arrange
        val code = "int *ptr1, *ptr2, *ptr3;"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("ptr1", "ptr2", "ptr3")
    }

    // === Typedef Function Pointer Tests ===

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

    // === Designated Initializer Tests ===

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

    // === Combined Complex Tests ===

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

    // === Edge Case Tests ===

    // --- Macro Edge Cases ---

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

    // --- Preprocessor Conditional Edge Cases ---

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

    // --- Goto Label Edge Cases ---

    @Test
    fun `should extract label at function start`() {
        // Arrange
        val code = """
            void func() {
            entry_point:
                int x = 0;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("func", "entry_point", "x")
    }

    @Test
    fun `should extract consecutive labels`() {
        // Arrange
        val code = """
            void func() {
            label1:
            label2:
            label3:
                return;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("func", "label1", "label2", "label3")
    }

    @Test
    fun `should extract label with underscore prefix`() {
        // Arrange
        val code = """
            void func() {
            _private_label:
            __internal:
                return;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("func", "_private_label", "__internal")
    }

    @Test
    fun `should extract label in switch case fallthrough`() {
        // Arrange
        val code = """
            void handle(int x) {
                switch(x) {
                    case 1:
                    case 2:
                    common_handling:
                        process();
                        break;
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("handle", "x", "common_handling")
    }

    // --- Multiple Declarators Edge Cases ---

    @Test
    fun `should handle single declarator in declaration`() {
        // Arrange
        val code = "int single;"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("single")
    }

    @Test
    fun `should handle many declarators in single declaration`() {
        // Arrange
        val code = "int a, b, c, d, e, f, g, h;"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("a", "b", "c", "d", "e", "f", "g", "h")
    }

    @Test
    fun `should handle mixed pointer depths in declaration`() {
        // Arrange
        val code = "int *p1, **p2, ***p3, x;"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("p1", "p2", "p3", "x")
    }

    @Test
    fun `should handle array and pointer mix in declaration`() {
        // Arrange
        val code = "char buf[100], *str, matrix[10][20], **argv;"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("buf", "str", "matrix", "argv")
    }

    @Test
    fun `should handle function pointer in multi-declaration`() {
        // Arrange
        val code = "int x, (*func_ptr)(int), y;"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("x", "func_ptr", "y")
    }

    @Test
    fun `should handle const and volatile in multi-declaration`() {
        // Arrange
        val code = "const int a = 1, b = 2, c = 3;"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("a", "b", "c")
    }

    // --- Designated Initializer Edge Cases ---

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

    // --- Typedef Edge Cases ---

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

    // --- Struct and Union Edge Cases ---

    @Test
    fun `should handle anonymous nested struct`() {
        // Arrange
        val code = """
            struct Outer {
                struct {
                    int inner_field;
                } anonymous;
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert - field declaration name comes before its nested content in tree traversal
        assertThat(result.identifiers).containsExactly("Outer", "anonymous", "inner_field")
    }

    @Test
    fun `should handle anonymous union in struct`() {
        // Arrange
        val code = """
            struct Data {
                int type;
                union {
                    int i;
                    float f;
                };
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("Data", "type", "i", "f")
    }

    @Test
    fun `should handle bit field declarations`() {
        // Arrange
        val code = """
            struct Flags {
                unsigned int flag1 : 1;
                unsigned int flag2 : 1;
                unsigned int reserved : 30;
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("Flags", "flag1", "flag2", "reserved")
    }

    @Test
    fun `should handle forward declaration`() {
        // Arrange
        val code = "struct ForwardDeclared;"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("ForwardDeclared")
    }

    // --- Comment Edge Cases ---

    @Test
    fun `should extract empty comment`() {
        // Arrange
        val code = """
            /**/
            int x;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("x")
        assertThat(result.comments).containsExactly("")
    }

    @Test
    fun `should extract comment with only whitespace`() {
        // Arrange
        val code = """
            /*   */
            int x;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("x")
        assertThat(result.comments).containsExactly("")
    }

    @Test
    fun `should handle comment with special characters`() {
        // Arrange
        val code = """
            // Special chars: @#$%^&*()!
            int x;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.comments).containsExactly("Special chars: @#\$%^&*()!")
    }

    // --- String Edge Cases ---

    @Test
    fun `should extract empty string`() {
        // Arrange
        val code = """
            char* empty = "";
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.strings).containsExactly("")
    }

    @Test
    fun `should extract string with escape sequences`() {
        // Arrange
        val code = """
            char* escaped = "line1\nline2\ttab";
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.strings).containsExactly("line1\\nline2\\ttab")
    }

    @Test
    fun `should extract adjacent string literals`() {
        // Arrange
        val code = """
            char* msg = "Hello" " " "World";
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.strings).containsExactly("Hello", " ", "World")
    }

    // --- Function Edge Cases ---

    @Test
    fun `should extract function with no parameters`() {
        // Arrange
        val code = "void no_params(void) {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("no_params")
    }

    @Test
    fun `should extract function with many parameters`() {
        // Arrange
        val code = "void many(int a, int b, int c, int d, int e) {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("many", "a", "b", "c", "d", "e")
    }

    @Test
    fun `should extract function pointer parameter`() {
        // Arrange
        val code = "void takes_callback(int (*cb)(int, int)) {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("takes_callback", "cb")
    }

    @Test
    fun `should extract static inline function`() {
        // Arrange
        val code = "static inline int add(int a, int b) { return a + b; }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("add", "a", "b")
    }

    // --- Identifier Edge Cases ---

    @Test
    fun `should handle very long identifier`() {
        // Arrange
        val longName = "a".repeat(100)
        val code = "int $longName;"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly(longName)
    }

    @Test
    fun `should handle identifier with numbers`() {
        // Arrange
        val code = "int var123, x1y2z3, _99bottles;"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("var123", "x1y2z3", "_99bottles")
    }

    @Test
    fun `should handle all uppercase identifier`() {
        // Arrange
        val code = "int SCREAMING_SNAKE_CASE;"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactly("SCREAMING_SNAKE_CASE")
    }

    // --- Combined Complex Edge Cases ---

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
