package de.maibornwolff.treesitter.excavationsite.languages.csharp

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CSharpCommentAndStringExtractionTest {
    @Test
    fun `should extract single line comment`() {
        // Arrange
        val code = """
            // This is a comment
            public class Example {}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.comments).hasSize(1)
        assertThat(result.comments[0]).isEqualTo("This is a comment")
    }

    @Test
    fun `should extract block comment`() {
        // Arrange
        val code = """
            /* This is a
               block comment */
            public class Example {}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.comments).containsExactly("This is a\nblock comment")
    }

    @Test
    fun `should extract xml documentation comment`() {
        // Arrange
        val code = """
            /// <summary>
            /// Documentation for the class
            /// </summary>
            public class Example {}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.comments).containsExactly("<summary>", "Documentation for the class", "</summary>")
    }

    @Test
    fun `should extract multiple comments`() {
        // Arrange
        val code = """
            // First comment
            public class Example {
                // Second comment
                void Method() {}
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.comments).containsExactly("First comment", "Second comment")
    }

    @Test
    fun `should extract string literal`() {
        // Arrange
        val code = """
            public class Example {
                string message = "Hello World";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.strings).containsExactly("Hello World")
    }

    @Test
    fun `should extract verbatim string literal`() {
        // Arrange
        val code = """
            public class Example {
                string path = @"C:\Users\Documents";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.strings).containsExactly("C:\\Users\\Documents")
    }

    @Test
    fun `should extract interpolated string`() {
        // Arrange
        val code = """
            public class Example {
                void Test(string name) {
                    var msg = ${"$"}"Hello {name}";
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.strings).containsExactly("Hello {name}")
    }

    @Test
    fun `should extract multiple strings`() {
        // Arrange
        val code = """
            public class Example {
                string first = "Hello";
                string second = "World";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.strings).containsExactly("Hello", "World")
    }

    @Test
    fun `should extract string from method argument`() {
        // Arrange
        val code = """
            public class Example {
                void Test() {
                    Console.WriteLine("Test message");
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.strings).containsExactly("Test message")
    }

    @Test
    fun `should not extract comment text from inside strings`() {
        // Arrange
        val code = """
            public class Example {
                string code = "// this is not a comment";
                string block = "/* also not a comment */";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "code", "block")
        assertThat(result.comments).isEmpty()
        assertThat(result.strings).containsExactly("// this is not a comment", "/* also not a comment */")
    }

    @Test
    fun `should not extract string from inside comments`() {
        // Arrange
        val code = """
            public class Example {
                // string notExtracted = "hidden";
                /* string alsoHidden = "invisible"; */
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example")
        assertThat(result.strings).isEmpty()
    }

    @Test
    fun `should handle string with escaped quotes`() {
        // Arrange
        val code = """
            public class Example {
                string escaped = "He said \"hello\"";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.CSHARP)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "escaped")
        assertThat(result.strings).containsExactly("He said \\\"hello\\\"")
    }
}
