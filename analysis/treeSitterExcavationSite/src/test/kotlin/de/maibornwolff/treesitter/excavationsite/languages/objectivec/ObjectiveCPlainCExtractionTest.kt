package de.maibornwolff.treesitter.excavationsite.languages.objectivec

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class ObjectiveCPlainCExtractionTest {
    @Test
    fun `should extract preprocessor macro definition`() {
        // Arrange
        val code = """
            #define APP_NAME @"MyApp"
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert - Macro name is extracted; macro value strings are not parsed as string nodes
        assertThat(result.identifiers).containsExactly("APP_NAME")
    }

    @Test
    fun `should extract numeric macro definition`() {
        // Arrange
        val code = """
            #define MAX_COUNT 100
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("MAX_COUNT")
    }

    @Test
    fun `should extract function-like macro definition`() {
        // Arrange
        val code = """
            #define MIN(a, b) ((a) < (b) ? (a) : (b))
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("MIN")
    }

    @Test
    fun `should extract multiple macro definitions`() {
        // Arrange
        val code = """
            #define VERSION 1
            #define BUILD_NUMBER 42
            #define APP_ID @"com.example.app"
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("VERSION", "BUILD_NUMBER", "APP_ID")
    }

    @Test
    fun `should handle struct declaration`() {
        // Arrange
        val code = """
            typedef struct {
                int x;
                int y;
            } Point;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("x", "y")
    }

    @Test
    fun `should extract from mixed C and Objective-C code`() {
        // Arrange
        val code = """
            #define MAX_SIZE 100

            static int helper_function(int param) {
                return param * 2;
            }

            @implementation Calculator
            - (int)calculateWithValue:(int)value {
                return helper_function(value);
            }
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "MAX_SIZE",
            "helper_function",
            "param",
            "Calculator",
            "calculateWithValue",
            "value"
        )
    }

    @Test
    fun `should handle static variables`() {
        // Arrange
        val code = """
            static NSString *sharedName;
            static int counter = 0;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("sharedName", "counter")
    }

    @Test
    fun `should handle extern declarations`() {
        // Arrange
        val code = """
            extern NSString *const kNotificationName;
            extern int globalCounter;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("kNotificationName", "globalCounter")
    }

    @Test
    fun `should handle typedef struct`() {
        // Arrange
        val code = """
            typedef struct {
                CGFloat x;
                CGFloat y;
                CGFloat width;
                CGFloat height;
            } MyRect;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("x", "y", "width", "height")
    }

    @Test
    fun `should handle typedef enum`() {
        // Arrange - Enum enumerators use different node types not in container set
        val code = """
            typedef enum {
                StatusPending,
                StatusActive,
                StatusCompleted
            } TaskStatus;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert - Enum enumerators are not currently extracted as identifiers
        assertThat(result.identifiers).isEmpty()
    }

    @Test
    fun `should handle NS_ENUM style enum`() {
        // Arrange - NS_ENUM is a macro that tree-sitter may handle differently
        val code = """
            typedef NS_ENUM(NSInteger, Direction) {
                DirectionNorth,
                DirectionSouth,
                DirectionEast,
                DirectionWest
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert - Enum enumerators are not currently extracted
        assertThat(result.identifiers).isEmpty()
    }

    @Test
    fun `should handle pointer to pointer declaration`() {
        // Arrange
        val code = """
            void test(NSError **errorPtr) {
                NSString **stringPtr;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "errorPtr", "stringPtr")
    }

    @Test
    fun `should handle array declaration`() {
        // Arrange
        val code = """
            void test() {
                int numbers[10];
                char name[256];
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "numbers", "name")
    }

    @Test
    fun `should handle function pointer declaration`() {
        // Arrange
        val code = """
            void test() {
                int (*compareFunc)(const void *, const void *);
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "compareFunc")
    }

    @Test
    fun `should handle conditional compilation`() {
        // Arrange
        val code = """
            #ifdef DEBUG
            #define LOG(msg) NSLog(@"%@", msg)
            #endif

            void test() {
                int value;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert - Only one LOG macro is extracted (ifdef branch)
        assertThat(result.identifiers).containsExactly("LOG", "test", "value")
    }

    @Test
    fun `should handle union declaration`() {
        // Arrange
        val code = """
            typedef union {
                int intValue;
                float floatValue;
                char charValue;
            } ValueUnion;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("intValue", "floatValue", "charValue")
    }

    @Test
    fun `should handle bitfield in struct`() {
        // Arrange
        val code = """
            typedef struct {
                unsigned int flag1 : 1;
                unsigned int flag2 : 1;
                unsigned int value : 6;
            } Flags;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("flag1", "flag2", "value")
    }

    @Test
    fun `should handle inline function`() {
        // Arrange
        val code = """
            static inline int square(int x) {
                return x * x;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("square", "x")
    }

    @Test
    fun `should handle const pointer declarations`() {
        // Arrange
        val code = """
            void test() {
                const char *constPtr;
                char *const ptrConst;
                const char *const bothConst;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "constPtr", "ptrConst", "bothConst")
    }
}
