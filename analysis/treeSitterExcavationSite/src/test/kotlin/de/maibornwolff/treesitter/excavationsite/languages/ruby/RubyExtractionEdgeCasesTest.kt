package de.maibornwolff.treesitter.excavationsite.languages.ruby

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

/**
 * Edge case tests for Ruby extraction to verify coverage.
 */
class RubyExtractionEdgeCasesTest {
    @Test
    fun `should extract block parameters with do-end syntax`() {
        // Arrange
        val code = """
            items.each do |item|
              puts item
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("item")
    }

    @Test
    fun `should extract destructured block parameters`() {
        // Arrange
        val code = "pairs.each { |(key, value)| puts key }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("key", "value")
    }

    @Test
    fun `should extract destructured method parameters`() {
        // Arrange
        val code = """
            def process((first, second))
              first + second
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("process", "first", "second")
    }

    @Test
    fun `should extract from private method definition`() {
        // Arrange
        val code = """
            private def secret_method(data)
              data
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("secret_method", "data")
    }

    @Test
    fun `should extract inject block with accumulator`() {
        // Arrange
        val code = "[1,2,3].inject(0) { |sum, num| sum + num }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("sum", "num")
    }

    @Test
    fun `should extract from multiple rescue clauses`() {
        // Arrange
        val code = """
            begin
              risky
            rescue TypeError => type_err
              handle_type(type_err)
            rescue => general_err
              handle_general(general_err)
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("type_err", "general_err")
    }

    @Test
    fun `should extract from case-when with assignment`() {
        // Arrange
        val code = """
            result = case value
            when 1 then "one"
            when 2 then "two"
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("result")
    }

    @Test
    fun `should extract nested hash symbol keys`() {
        // Arrange
        val code = "opts = { outer: { inner: 1 } }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("opts", "outer", "inner")
    }

    @Test
    fun `should extract method with keyword argument defaults`() {
        // Arrange
        val code = """
            def configure(timeout: 30, retries: 3)
              @timeout = timeout
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("configure", "timeout", "retries", "timeout")
    }

    // === Multiline Comment Tests ===

    @Test
    fun `should extract multiline comment`() {
        // Arrange
        val code = """
            =begin
            This is a multiline comment
            spanning multiple lines
            =end
            x = 1
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.comments).containsExactly("This is a multiline comment\nspanning multiple lines")
    }

    @Test
    fun `should extract multiline comment with single line content`() {
        // Arrange
        val code = """
            =begin
            Single line content
            =end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.comments).containsExactly("Single line content")
    }

    // === Nested Namespace Tests ===

    @Test
    fun `should extract all identifiers from nested class declaration`() {
        // Arrange
        val code = """
            class Outer::Inner::Deep
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("Outer", "Inner", "Deep")
    }

    @Test
    fun `should extract all identifiers from nested module declaration`() {
        // Arrange
        val code = """
            module Api::V1::Users
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("Api", "V1", "Users")
    }

    // === Word/Symbol Array Tests ===

    @Test
    fun `should extract strings from word array`() {
        // Arrange
        val code = "words = %w[foo bar baz]"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.strings).containsExactly("foo", "bar", "baz")
    }

    @Test
    fun `should extract strings from symbol array`() {
        // Arrange
        val code = "symbols = %i[name email age]"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.strings).containsExactly("name", "email", "age")
    }

    @Test
    fun `should extract strings from word array with parentheses`() {
        // Arrange
        val code = "words = %w(one two three)"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.strings).containsExactly("one", "two", "three")
    }
}
