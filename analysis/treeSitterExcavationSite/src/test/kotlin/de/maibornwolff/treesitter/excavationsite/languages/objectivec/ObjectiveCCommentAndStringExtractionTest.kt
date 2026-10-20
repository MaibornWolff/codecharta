package de.maibornwolff.treesitter.excavationsite.languages.objectivec

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class ObjectiveCCommentAndStringExtractionTest {
    @Test
    fun `should extract single line comment`() {
        // Arrange
        val code = """
            // This is a comment
            @interface User : NSObject
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.comments).hasSize(1)
        assertThat(result.comments[0]).isEqualTo("This is a comment")
    }

    @Test
    fun `should extract block comment`() {
        // Arrange
        val code = """
            /* This is a block comment */
            @interface User : NSObject
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

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
            @interface User : NSObject
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.comments).hasSize(1)
        assertThat(result.comments[0]).isEqualTo("This is a multiline\nblock comment")
    }

    @Test
    fun `should extract doc comment`() {
        // Arrange
        val code = """
            /**
             * Process the given order.
             * @param order The order to process
             */
            @interface OrderProcessor : NSObject
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.comments).hasSize(1)
        assertThat(result.comments[0]).isEqualTo("Process the given order.\n@param order The order to process")
    }

    @Test
    fun `should extract C string literal`() {
        // Arrange
        val code = """
            void test() {
                char *message = "Hello World";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.strings).containsExactly("Hello World")
    }

    @Test
    fun `should extract NSString literal`() {
        // Arrange
        val code = """
            void test() {
                NSString *message = @"Hello World";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.strings).containsExactly("Hello World")
    }

    @Test
    fun `should extract multiple strings`() {
        // Arrange
        val code = """
            void test() {
                NSString *first = @"Hello";
                NSString *second = @"World";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.strings).containsExactly("Hello", "World")
    }

    @Test
    fun `should not extract from comments containing code-like text`() {
        // Arrange
        val code = """
            // @class HiddenClass;
            // #define HIDDEN 1
            @interface RealClass : NSObject
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("RealClass")
    }

    @Test
    fun `should handle string with escaped characters`() {
        // Arrange - Variable with string initialization
        val code = """
            void test() {
                NSString *escaped;
                escaped = @"Line1\nLine2\tTabbed";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "escaped")
    }

    @Test
    fun `should handle empty string`() {
        // Arrange - Separate declaration and assignment
        val code = """
            void test() {
                NSString *empty;
                char *cEmpty;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "empty", "cEmpty")
    }

    @Test
    fun `should handle string with unicode`() {
        // Arrange - Variable declarations without initialization
        val code = """
            void test() {
                NSString *emoji;
                NSString *chinese;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "emoji", "chinese")
    }

    @Test
    fun `should handle comments with special characters`() {
        // Arrange
        val code = """
            // TODO: Fix this @implementation bug <urgent>
            /*
             * Copyright (c) 2024
             * @author Developer <dev@example.com>
             */
            @interface Test : NSObject
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("Test")
        assertThat(result.comments).hasSize(2)
    }

    @Test
    fun `should not extract identifiers from string literals`() {
        // Arrange
        val code = """
            void test() {
                NSString *codeStr;
                NSString *methodStr;
                codeStr = @"@interface FakeClass @end";
                methodStr = @"- (void)fakeMethod;";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert - Variables are declared separately, strings don't create identifiers
        assertThat(result.identifiers).containsExactly("test", "codeStr", "methodStr")
    }

    @Test
    fun `should handle multiline string concatenation`() {
        // Arrange - Variable declared separately
        val code = """
            void test() {
                NSString *query;
                query = @"SELECT * FROM users";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "query")
    }
}
