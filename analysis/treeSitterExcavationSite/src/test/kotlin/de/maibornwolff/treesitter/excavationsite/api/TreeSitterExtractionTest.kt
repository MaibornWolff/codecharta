package de.maibornwolff.treesitter.excavationsite.api

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class TreeSitterExtractionTest {
    @Test
    fun `should extract text from simple Java class`() {
        // Arrange
        val javaCode = """
            public class HelloWorld {
                // A simple greeting method
                public void sayHello() {
                    String message = "Hello, World!";
                    System.out.println(message);
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(javaCode, Language.JAVA)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("HelloWorld", "sayHello", "message")
        assertThat(result.comments).isNotEmpty
        assertThat(result.strings).containsExactly("Hello, World!")
    }

    @Test
    fun `should extract text from Kotlin file`() {
        // Arrange
        val kotlinCode = """
            // Main entry point
            fun greet(name: String): String {
                val greeting = "Hello"
                return "${'$'}greeting, ${'$'}name!"
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(kotlinCode, Language.KOTLIN)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("greet", "name", "greeting")
        assertThat(result.comments).isNotEmpty
        assertThat(result.strings).containsExactlyInAnyOrder("Hello", ", ")
    }

    @Test
    fun `should extract text from Python file`() {
        // Arrange
        val pythonCode = """
            # Calculate the sum of two numbers
            def add(a, b):
                result = a + b
                return result

            message = "Sum calculated"
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(pythonCode, Language.PYTHON)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("add", "a", "b", "result", "message")
        assertThat(result.comments).isNotEmpty
        assertThat(result.strings).containsExactly("Sum calculated")
    }

    @Test
    fun `should check extraction support by language`() {
        // Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.JAVA)).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.KOTLIN)).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.PYTHON)).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.TYPESCRIPT)).isTrue()
    }

    @Test
    fun `should check extraction support by extension`() {
        // Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(".java")).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".kt")).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".py")).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".unknown")).isFalse()
    }

    @Test
    fun `should return supported languages`() {
        // Act
        val languages = TreeSitterExtraction.getSupportedLanguages()

        // Assert
        assertThat(languages).containsExactlyInAnyOrder(
            Language.JAVA, Language.KOTLIN, Language.TYPESCRIPT, Language.JAVASCRIPT,
            Language.PYTHON, Language.GO, Language.PHP, Language.RUBY, Language.SWIFT,
            Language.BASH, Language.CSHARP, Language.CPP, Language.C, Language.OBJECTIVE_C,
            Language.VUE, Language.ABL, Language.TSX, Language.DELPHI, Language.RUST
        )
        assertThat(languages).hasSize(19)
    }

    @Test
    fun `should return supported extensions`() {
        // Act
        val extensions = TreeSitterExtraction.getSupportedExtensions()

        // Assert
        assertThat(extensions).containsExactlyInAnyOrder(
            ".java", ".kt", ".kts", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
            ".py", ".go", ".php", ".rb", ".swift", ".sh", ".bash", ".cs",
            ".cpp", ".cc", ".cxx", ".hpp", ".hxx", ".h", ".c", ".m", ".mm",
            ".vue", ".p", ".cls", ".w", ".i", ".pas", ".dpr", ".rs"
        )
        assertThat(extensions).hasSize(34)
    }

    @Test
    fun `should provide extracted texts with context`() {
        // Arrange
        val javaCode = """
            public class Test {
                // A comment
                String value = "text";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(javaCode, Language.JAVA)

        // Assert
        assertThat(result.extractedTexts).isNotEmpty
        assertThat(result.extractedTexts.map { it.context }.distinct()).containsExactlyInAnyOrder(
            ExtractionContext.IDENTIFIER,
            ExtractionContext.COMMENT,
            ExtractionContext.STRING
        )
    }
}
