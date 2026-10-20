package de.maibornwolff.treesitter.excavationsite.languages.c

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CDeclarationExtractionTest {
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
}
