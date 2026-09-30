package de.maibornwolff.treesitter.excavationsite.languages.c

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments.argumentSet
import org.junit.jupiter.params.provider.MethodSource

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CExtractionTest {
    @ParameterizedTest
    @MethodSource("functionCases")
    fun `should extract function and parameter identifiers`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun functionCases() = listOf(
        argumentSet(
            "extract function definition identifier",
            """
                void process_order() {
                }
            """.trimIndent(),
            listOf("process_order")
        ),
        argumentSet(
            "extract function with return type and parameters",
            """
                int calculate_total(int count, float price) {
                    return count * price;
                }
            """.trimIndent(),
            listOf("calculate_total", "count", "price")
        ),
        argumentSet(
            "extract parameter identifiers",
            """
                void process(int order_id, char* customer_name) {
                }
            """.trimIndent(),
            listOf("process", "order_id", "customer_name")
        ),
        argumentSet("extract extern function declaration", "extern void externalFunction(int param);", listOf("externalFunction", "param")),
        argumentSet("extract function with no parameters", "void no_params(void) {}", listOf("no_params")),
        argumentSet(
            "extract function with many parameters",
            "void many(int a, int b, int c, int d, int e) {}",
            listOf("many", "a", "b", "c", "d", "e")
        ),
        argumentSet("extract function pointer parameter", "void takes_callback(int (*cb)(int, int)) {}", listOf("takes_callback", "cb")),
        argumentSet("extract static inline function", "static inline int add(int a, int b) { return a + b; }", listOf("add", "a", "b"))
    )

    @ParameterizedTest
    @MethodSource("variableCases")
    fun `should extract variable declarator identifiers`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun variableCases() = listOf(
        argumentSet("extract simple variable declaration", "int order_count;", listOf("order_count")),
        argumentSet("extract initialized variable declaration", "int order_count = 10;", listOf("order_count")),
        argumentSet("extract pointer variable declaration", "int *order_ptr;", listOf("order_ptr")),
        argumentSet("extract double pointer variable declaration", "char **string_array;", listOf("string_array")),
        argumentSet("extract array variable declaration", "int order_ids[100];", listOf("order_ids")),
        argumentSet("extract multidimensional array declaration", "int matrix[10][20];", listOf("matrix")),
        argumentSet("extract static variable declaration", "static int instance_count = 0;", listOf("instance_count")),
        argumentSet("extract extern variable declaration", "extern int global_counter;", listOf("global_counter")),
        argumentSet("extract const static variable", "static const char* MESSAGE = \"hello\";", listOf("MESSAGE")),
        argumentSet("extract volatile variable", "volatile int interrupt_flag;", listOf("interrupt_flag")),
        argumentSet("extract all declarators from multi-variable declaration", "int a, b, c;", listOf("a", "b", "c")),
        argumentSet("extract all declarators with initializers", "int x = 1, y = 2, z = 3;", listOf("x", "y", "z")),
        argumentSet("extract mixed initialized and uninitialized declarators", "int a, b = 10, c;", listOf("a", "b", "c")),
        argumentSet("extract pointer and non-pointer declarators", "char *p, **pp, arr[10];", listOf("p", "pp", "arr")),
        argumentSet("extract multiple pointer declarators", "int *ptr1, *ptr2, *ptr3;", listOf("ptr1", "ptr2", "ptr3")),
        argumentSet("handle single declarator in declaration", "int single;", listOf("single")),
        argumentSet(
            "handle many declarators in single declaration",
            "int a, b, c, d, e, f, g, h;",
            listOf("a", "b", "c", "d", "e", "f", "g", "h")
        ),
        argumentSet("handle mixed pointer depths in declaration", "int *p1, **p2, ***p3, x;", listOf("p1", "p2", "p3", "x")),
        argumentSet(
            "handle array and pointer mix in declaration",
            "char buf[100], *str, matrix[10][20], **argv;",
            listOf("buf", "str", "matrix", "argv")
        ),
        argumentSet("handle function pointer in multi-declaration", "int x, (*func_ptr)(int), y;", listOf("x", "func_ptr", "y")),
        argumentSet("handle const and volatile in multi-declaration", "const int a = 1, b = 2, c = 3;", listOf("a", "b", "c"))
    )

    @ParameterizedTest
    @MethodSource("structUnionEnumCases")
    fun `should extract struct, union and enum identifiers`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun structUnionEnumCases() = listOf(
        argumentSet(
            "extract struct specifier identifier",
            """
                struct User {
                    int id;
                };
            """.trimIndent(),
            listOf("User", "id")
        ),
        argumentSet(
            "extract struct field identifiers",
            """
                struct Order {
                    int order_id;
                    char* customer_name;
                    float total_amount;
                };
            """.trimIndent(),
            listOf("Order", "order_id", "customer_name", "total_amount")
        ),
        argumentSet(
            "extract enum specifier identifier",
            """
                enum Status {
                    PENDING,
                    ACTIVE
                };
            """.trimIndent(),
            listOf("Status", "PENDING", "ACTIVE")
        ),
        argumentSet(
            "extract enumerator identifiers",
            """
                enum OrderStatus {
                    PENDING,
                    PROCESSING,
                    SHIPPED,
                    DELIVERED
                };
            """.trimIndent(),
            listOf("OrderStatus", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED")
        ),
        argumentSet(
            "extract union specifier identifier",
            """
                union Data {
                    int i;
                    float f;
                };
            """.trimIndent(),
            listOf("Data", "i", "f")
        ),
        argumentSet(
            "extract union field identifiers",
            """
                union Value {
                    int int_value;
                    float float_value;
                    char* string_value;
                };
            """.trimIndent(),
            listOf("Value", "int_value", "float_value", "string_value")
        ),
        argumentSet("handle anonymous struct", "struct { int x; } point;", listOf("point", "x")),
        argumentSet(
            "handle anonymous nested struct",
            """
                struct Outer {
                    struct {
                        int inner_field;
                    } anonymous;
                };
            """.trimIndent(),
            listOf("Outer", "anonymous", "inner_field")
        ),
        argumentSet(
            "handle anonymous union in struct",
            """
                struct Data {
                    int type;
                    union {
                        int i;
                        float f;
                    };
                };
            """.trimIndent(),
            listOf("Data", "type", "i", "f")
        ),
        argumentSet(
            "handle bit field declarations",
            """
                struct Flags {
                    unsigned int flag1 : 1;
                    unsigned int flag2 : 1;
                    unsigned int reserved : 30;
                };
            """.trimIndent(),
            listOf("Flags", "flag1", "flag2", "reserved")
        ),
        argumentSet("handle forward declaration", "struct ForwardDeclared;", listOf("ForwardDeclared"))
    )

    @ParameterizedTest
    @MethodSource("typedefCases")
    fun `should extract typedef names`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun typedefCases() = listOf(
        argumentSet("extract typedef identifier", "typedef int UserId;", listOf("UserId")),
        argumentSet(
            "extract typedef struct identifier",
            """
                typedef struct {
                    int x;
                    int y;
                } Point;
            """.trimIndent(),
            listOf("Point", "x", "y")
        ),
        argumentSet(
            "handle complex typedef with struct",
            """
                typedef struct Node {
                    int value;
                    struct Node* next;
                } Node;
            """.trimIndent(),
            listOf("Node", "Node", "value", "next", "Node")
        ),
        argumentSet("extract typedef function pointer name", "typedef int (*Comparator)(const void*, const void*);", listOf("Comparator")),
        argumentSet("extract typedef void function pointer name", "typedef void (*Handler)(int, const char*);", listOf("Handler")),
        argumentSet(
            "extract typedef callback function pointer with named params",
            "typedef int (*Callback)(void* context, int event);",
            listOf("Callback", "context", "event")
        ),
        argumentSet("extract typedef pointer to array", "typedef int (*ArrayPtr)[10];", listOf("ArrayPtr")),
        argumentSet(
            "extract typedef of pointer to function returning pointer",
            "typedef char* (*StringFactory)(void);",
            listOf("StringFactory")
        ),
        argumentSet("extract typedef of array", "typedef int IntArray[100];", listOf("IntArray")),
        argumentSet("extract typedef of pointer to array", "typedef int (*PtrToArray)[10];", listOf("PtrToArray")),
        argumentSet(
            "extract multiple typedefs in sequence",
            """
                typedef unsigned char byte;
                typedef unsigned short word;
                typedef unsigned int dword;
            """.trimIndent(),
            listOf("byte", "word", "dword")
        ),
        argumentSet("extract typedef with const qualifier", "typedef const char* ConstString;", listOf("ConstString"))
    )

    @ParameterizedTest
    @MethodSource("macroCases")
    fun `should extract macro names`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun macroCases() = listOf(
        argumentSet("extract macro constant name", "#define MAX_SIZE 100", listOf("MAX_SIZE")),
        argumentSet("extract macro function name", "#define MIN(a, b) ((a) < (b) ? (a) : (b))", listOf("MIN")),
        argumentSet("extract variadic macro name", "#define LOG(fmt, ...) printf(fmt, ##__VA_ARGS__)", listOf("LOG")),
        argumentSet(
            "extract multiple macro definitions",
            """
                #define PI 3.14159
                #define E 2.71828
                #define SQUARE(x) ((x) * (x))
            """.trimIndent(),
            listOf("PI", "E", "SQUARE")
        ),
        argumentSet("extract macro with no value", "#define FEATURE_ENABLED", listOf("FEATURE_ENABLED")),
        argumentSet("extract debug print macro", """#define DEBUG_PRINT(fmt, ...) printf(fmt, ##__VA_ARGS__)""", listOf("DEBUG_PRINT")),
        argumentSet("extract macro with empty body", "#define EMPTY_MACRO", listOf("EMPTY_MACRO")),
        argumentSet("extract macro with complex expression", "#define COMPLEX ((1 << 8) | (1 << 4) | 0x0F)", listOf("COMPLEX")),
        argumentSet("extract macro with string value", """#define VERSION_STRING "1.0.0"""", listOf("VERSION_STRING")),
        argumentSet("extract macro function with no parameters", "#define GET_VALUE() (global_value)", listOf("GET_VALUE")),
        argumentSet(
            "extract macro function with many parameters",
            "#define MULTI(a, b, c, d, e) ((a) + (b) + (c) + (d) + (e))",
            listOf("MULTI")
        ),
        argumentSet(
            "extract macro with line continuation",
            """
                #define LONG_MACRO(x) \
                    do { \
                        process(x); \
                    } while(0)
            """.trimIndent(),
            listOf("LONG_MACRO")
        ),
        argumentSet(
            "handle underscore-prefixed macro names",
            """
                #define _INTERNAL_FLAG 1
                #define __DOUBLE_UNDERSCORE 2
                #define ___TRIPLE 3
            """.trimIndent(),
            listOf("_INTERNAL_FLAG", "__DOUBLE_UNDERSCORE", "___TRIPLE")
        )
    )

    @ParameterizedTest
    @MethodSource("preprocessorConditionalCases")
    fun `should extract preprocessor condition names`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun preprocessorConditionalCases() = listOf(
        argumentSet(
            "extract ifdef condition",
            """
                #ifdef DEBUG
                int debugMode = 1;
                #endif
            """.trimIndent(),
            listOf("DEBUG", "debugMode")
        ),
        argumentSet(
            "extract ifndef condition",
            """
                #ifndef HEADER_H
                #define HEADER_H
                #endif
            """.trimIndent(),
            listOf("HEADER_H", "HEADER_H")
        ),
        argumentSet(
            "extract multiple ifdef conditions",
            """
                #ifdef FEATURE_A
                int featureA = 1;
                #endif
                #ifdef FEATURE_B
                int featureB = 1;
                #endif
            """.trimIndent(),
            listOf("FEATURE_A", "featureA", "FEATURE_B", "featureB")
        ),
        argumentSet(
            "extract nested ifdef conditions",
            """
                #ifdef PLATFORM_LINUX
                #ifdef ARCH_X86
                int linuxX86 = 1;
                #endif
                #endif
            """.trimIndent(),
            listOf("PLATFORM_LINUX", "ARCH_X86", "linuxX86")
        ),
        argumentSet(
            "extract deeply nested ifdef conditions",
            """
                #ifdef LEVEL1
                #ifdef LEVEL2
                #ifdef LEVEL3
                int deep = 1;
                #endif
                #endif
                #endif
            """.trimIndent(),
            listOf("LEVEL1", "LEVEL2", "LEVEL3", "deep")
        ),
        argumentSet(
            "extract ifdef with else branch",
            """
                #ifdef DEBUG
                int debug_val = 1;
                #else
                int release_val = 0;
                #endif
            """.trimIndent(),
            listOf("DEBUG", "debug_val", "release_val")
        ),
        argumentSet(
            "extract ifndef for header guard pattern",
            """
                #ifndef _MY_HEADER_H_
                #define _MY_HEADER_H_
                int exported_function(void);
                #endif
            """.trimIndent(),
            listOf("_MY_HEADER_H_", "_MY_HEADER_H_", "exported_function")
        ),
        argumentSet(
            "handle empty ifdef block",
            """
                #ifdef UNUSED_FLAG
                #endif
            """.trimIndent(),
            listOf("UNUSED_FLAG")
        )
    )

    @ParameterizedTest
    @MethodSource("gotoLabelCases")
    fun `should extract goto labels`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun gotoLabelCases() = listOf(
        argumentSet(
            "extract goto label",
            """
                void process() {
                    start:
                        goto cleanup;
                    cleanup:
                        return;
                }
            """.trimIndent(),
            listOf("process", "start", "cleanup")
        ),
        argumentSet(
            "extract single label in function",
            """
                void retry_operation() {
                    retry:
                        int x = 0;
                }
            """.trimIndent(),
            listOf("retry_operation", "retry", "x")
        ),
        argumentSet(
            "extract multiple labels in function",
            """
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
            """.trimIndent(),
            listOf("state_machine", "input", "state_a", "state_b", "state_c")
        ),
        argumentSet(
            "extract label at function start",
            """
                void func() {
                entry_point:
                    int x = 0;
                }
            """.trimIndent(),
            listOf("func", "entry_point", "x")
        ),
        argumentSet(
            "extract consecutive labels",
            """
                void func() {
                label1:
                label2:
                label3:
                    return;
                }
            """.trimIndent(),
            listOf("func", "label1", "label2", "label3")
        ),
        argumentSet(
            "extract label with underscore prefix",
            """
                void func() {
                _private_label:
                __internal:
                    return;
                }
            """.trimIndent(),
            listOf("func", "_private_label", "__internal")
        ),
        argumentSet(
            "extract label in switch case fallthrough",
            """
                void handle(int x) {
                    switch(x) {
                        case 1:
                        case 2:
                        common_handling:
                            process();
                            break;
                    }
                }
            """.trimIndent(),
            listOf("handle", "x", "common_handling")
        )
    )

    @ParameterizedTest
    @MethodSource("designatedInitializerCases")
    fun `should extract designated initializer field names`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun designatedInitializerCases() = listOf(
        argumentSet("extract designated initializer field names", "struct Point p = { .x = 10, .y = 20 };", listOf("p", "Point", "x", "y")),
        argumentSet(
            "extract designated initializer with single field",
            "struct Config cfg = { .timeout = 30 };",
            listOf("cfg", "Config", "timeout")
        ),
        argumentSet(
            "extract designated initializer with many fields",
            "struct Rectangle rect = { .x = 0, .y = 0, .width = 100, .height = 50 };",
            listOf("rect", "Rectangle", "x", "y", "width", "height")
        ),
        argumentSet(
            "extract nested struct designated initializers",
            "struct Circle circle = { .center = { .x = 5, .y = 5 }, .radius = 10 };",
            listOf("circle", "Circle", "center", "x", "y", "radius")
        ),
        argumentSet(
            "handle mixed designated and positional initializers",
            "struct Mix m = { 1, .named = 2, 3 };",
            listOf("m", "Mix", "named")
        ),
        argumentSet("handle array with designated initializers", "int arr[10] = { [0] = 1, [5] = 2, [9] = 3 };", listOf("arr")),
        argumentSet(
            "handle deeply nested designated initializers",
            """
                struct Outer o = {
                    .inner = {
                        .deep = {
                            .value = 42
                        }
                    }
                };
            """.trimIndent(),
            listOf("o", "Outer", "inner", "deep", "value")
        ),
        argumentSet("handle empty struct initializer", "struct Empty e = {};", listOf("e", "Empty")),
        argumentSet(
            "handle designated initializer with string",
            """struct Config cfg = { .name = "test", .id = 1 };""",
            listOf("cfg", "Config", "name", "id")
        )
    )

    @ParameterizedTest
    @MethodSource("identifierNamingCases")
    fun `should extract identifiers regardless of their spelling`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun identifierNamingCases() = listOf(
        argumentSet("handle very long identifier", "int ${"a".repeat(100)};", listOf("a".repeat(100))),
        argumentSet("handle identifier with numbers", "int var123, x1y2z3, _99bottles;", listOf("var123", "x1y2z3", "_99bottles")),
        argumentSet("handle all uppercase identifier", "int SCREAMING_SNAKE_CASE;", listOf("SCREAMING_SNAKE_CASE"))
    )

    @ParameterizedTest
    @MethodSource("completeSourceCases")
    fun `should extract identifiers from complete source files`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun completeSourceCases() = listOf(
        argumentSet(
            "extract from complex header file",
            """
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
            """.trimIndent(),
            listOf(
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
        ),
        argumentSet(
            "extract from function with goto cleanup pattern",
            """
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
            """.trimIndent(),
            listOf("initialize_resources", "count", "buffer", "result", "cleanup")
        ),
        argumentSet(
            "extract from struct with designated initializers in function",
            """
                struct Point {
                    int x;
                    int y;
                };

                struct Point create_point(int px, int py) {
                    struct Point p = { .x = px, .y = py };
                    return p;
                }
            """.trimIndent(),
            listOf("Point", "x", "y", "create_point", "Point", "px", "py", "p", "Point", "x", "y")
        ),
        argumentSet(
            "extract from platform-specific code",
            """
                #ifdef _WIN32
                #define PATH_SEPARATOR '\\'
                int platform_id = 1;
                #endif

                #ifdef __linux__
                #define PATH_SEPARATOR '/'
                int platform_id = 2;
                #endif
            """.trimIndent(),
            listOf("_WIN32", "PATH_SEPARATOR", "platform_id", "__linux__", "PATH_SEPARATOR", "platform_id")
        ),
        argumentSet(
            "handle file with only preprocessor directives",
            """
                #ifndef GUARD
                #define GUARD
                #define VALUE 42
                #endif
            """.trimIndent(),
            listOf("GUARD", "GUARD", "VALUE")
        ),
        argumentSet(
            "handle error handling pattern with goto",
            """
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
            """.trimIndent(),
            listOf("init", "a", "b", "c", "err_c", "err_b", "err_a")
        ),
        argumentSet(
            "handle complex macro and struct combination",
            """
                #define DECLARE_STRUCT(name) \
                    struct name { int value; }

                #ifdef USE_CUSTOM
                DECLARE_STRUCT(Custom);
                #else
                struct Default { int value; };
                #endif
            """.trimIndent(),
            listOf("DECLARE_STRUCT", "USE_CUSTOM", "Default", "value")
        )
    )

    @ParameterizedTest
    @MethodSource("commentCases")
    fun `should extract comment text`(code: String, expectedComment: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.comments).containsExactly(expectedComment)
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun commentCases() = listOf(
        argumentSet("extract single line comment", "// This is a comment\nint x;", "This is a comment", listOf("x")),
        argumentSet("extract block comment", "/* This is a block comment */\nint x;", "This is a block comment", listOf("x")),
        argumentSet(
            "extract multiline block comment",
            """
                /*
                 * This is a multiline
                 * block comment
                 */
                int x;
            """.trimIndent(),
            "This is a multiline\nblock comment",
            listOf("x")
        ),
        argumentSet(
            "extract doc comment",
            """
                /**
                 * Calculate the total price.
                 * @param count Number of items
                 * @param price Price per item
                 */
                int calculate(int count, int price) {
                    return count * price;
                }
            """.trimIndent(),
            "Calculate the total price.\n@param count Number of items\n@param price Price per item",
            listOf("calculate", "count", "price")
        ),
        argumentSet("extract empty comment", "/**/\nint x;", "", listOf("x")),
        argumentSet("extract comment with only whitespace", "/*   */\nint x;", "", listOf("x")),
        argumentSet(
            "handle comment with special characters",
            "// Special chars: @#\$%^&*()!\nint x;",
            "Special chars: @#\$%^&*()!",
            listOf("x")
        )
    )

    @ParameterizedTest
    @MethodSource("stringCases")
    fun `should extract string and char literals`(code: String, expectedStrings: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.C)

        // Assert
        assertThat(result.strings).containsExactlyElementsOf(expectedStrings)
    }

    fun stringCases() = listOf(
        argumentSet(
            "extract string literal",
            """
                int main() {
                    char* message = "Hello World";
                    return 0;
                }
            """.trimIndent(),
            listOf("Hello World")
        ),
        argumentSet(
            "extract multiple strings",
            """
                int main() {
                    char* first = "Hello";
                    char* second = "World";
                    return 0;
                }
            """.trimIndent(),
            listOf("Hello", "World")
        ),
        argumentSet(
            "extract char literal",
            """
                int main() {
                    char c = 'A';
                    return 0;
                }
            """.trimIndent(),
            listOf("A")
        ),
        argumentSet("extract empty string", """char* empty = "";""", listOf("")),
        argumentSet("extract string with escape sequences", """char* escaped = "line1\nline2\ttab";""", listOf("line1\\nline2\\ttab")),
        argumentSet("extract adjacent string literals", """char* msg = "Hello" " " "World";""", listOf("Hello", " ", "World")),
        argumentSet("extract string in designated initializer", """struct Config cfg = { .name = "test", .id = 1 };""", listOf("test"))
    )

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
}
