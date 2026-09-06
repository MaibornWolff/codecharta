package de.maibornwolff.treesitter.excavationsite.languages.ruby

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class RubyExtractionTest {
    // === Identifier Extraction Tests ===

    @Test
    fun `should extract class identifier`() {
        // Arrange
        val code = """
            class UserService
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("UserService")
    }

    @Test
    fun `should extract module identifier`() {
        // Arrange
        val code = """
            module Orders
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("Orders")
    }

    @Test
    fun `should extract method identifier`() {
        // Arrange
        val code = """
            def process_order
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("process_order")
    }

    @Test
    fun `should extract singleton method identifier`() {
        // Arrange
        val code = """
            def self.find
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("find")
    }

    @Test
    fun `should extract local variable assignment`() {
        // Arrange
        val code = "order_total = 100"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("order_total")
    }

    @Test
    fun `should extract instance variable assignment without prefix`() {
        // Arrange
        val code = "@customer_name = 'John'"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("customer_name")
    }

    @Test
    fun `should extract class variable assignment without prefix`() {
        // Arrange
        val code = "@@counter = 0"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("counter")
    }

    @Test
    fun `should extract global variable assignment without prefix`() {
        // Arrange
        val code = "\$debug_mode = true"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("debug_mode")
    }

    @Test
    fun `should extract method parameter identifiers`() {
        // Arrange
        val code = """
            def calculate(price, quantity)
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("calculate", "price", "quantity")
    }

    @Test
    fun `should extract keyword parameter identifiers`() {
        // Arrange
        val code = """
            def create_order(customer_id:, product_id:)
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("create_order", "customer_id", "product_id")
    }

    @Test
    fun `should extract optional parameter identifiers`() {
        // Arrange
        val code = """
            def greet(name = "World")
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("greet", "name")
    }

    @Test
    fun `should extract splat parameter identifiers`() {
        // Arrange
        val code = """
            def process(*args)
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("process", "args")
    }

    @Test
    fun `should extract hash splat parameter identifiers`() {
        // Arrange
        val code = """
            def configure(**options)
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("configure", "options")
    }

    @Test
    fun `should extract block parameter identifiers`() {
        // Arrange
        val code = """
            def with_transaction(&block)
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("with_transaction", "block")
    }

    @Test
    fun `should extract block parameter identifiers from blocks`() {
        // Arrange
        val code = """
            orders.each { |order| process(order) }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("order")
    }

    @Test
    fun `should extract constant identifiers`() {
        // Arrange
        val code = "MAX_ITEMS = 100"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("MAX_ITEMS")
    }

    @Test
    fun `should extract identifiers from complex class`() {
        // Arrange
        val code = """
            class OrderProcessor
              def initialize(order_id)
                @order_id = order_id
              end

              def process
                result = validate
              end

              private

              def validate
                true
              end
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "OrderProcessor",
            "initialize",
            "order_id",
            "order_id",
            "process",
            "result",
            "validate"
        )
    }

    @Test
    fun `should extract method with predicate suffix`() {
        // Arrange
        val code = """
            def valid?
              true
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("valid?")
    }

    @Test
    fun `should extract method with bang suffix`() {
        // Arrange
        val code = """
            def save!
              true
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("save!")
    }

    @Test
    fun `should handle empty source code`() {
        // Arrange
        val code = ""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).isEmpty()
        assertThat(result.comments).isEmpty()
        assertThat(result.strings).isEmpty()
    }

    // === Comment Extraction Tests ===

    @Test
    fun `should extract single line comment`() {
        // Arrange
        val code = """
            # This is a comment
            x = 1
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.comments).containsExactly("This is a comment")
    }

    @Test
    fun `should extract multiple comments`() {
        // Arrange
        val code = """
            # First comment
            x = 1
            # Second comment
            y = 2
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.comments).containsExactly("First comment", "Second comment")
    }

    @Test
    fun `should extract inline comment`() {
        // Arrange
        val code = "x = 1 # inline comment"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.comments).containsExactly("inline comment")
    }

    // === String Extraction Tests ===

    @Test
    fun `should extract double quoted string`() {
        // Arrange
        val code = """message = "Hello World""""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.strings).containsExactly("Hello World")
    }

    @Test
    fun `should extract single quoted string`() {
        // Arrange
        val code = """message = 'Hello World'"""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.strings).containsExactly("Hello World")
    }

    @Test
    fun `should extract symbol as string`() {
        // Arrange
        val code = "status = :pending"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.strings).containsExactly("pending")
    }

    @Test
    fun `should extract multiple symbols`() {
        // Arrange
        val code = """
            status = :pending
            type = :order
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.strings).containsExactly("pending", "order")
    }

    @Test
    fun `should extract regex pattern`() {
        // Arrange
        val code = """pattern = /order_\d+/"""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.strings).containsExactly("""order_\d+""")
    }

    @Test
    fun `should extract multiple strings`() {
        // Arrange
        val code = """
            first = "Hello"
            second = "World"
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.strings).containsExactly("Hello", "World")
    }

    // === ExtractionResult Tests ===

    @Test
    fun `should correctly categorize extracted items by context`() {
        // Arrange
        val code = """
            # Comment about the class
            class Example
              NAME = "test"
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "NAME")
        assertThat(result.comments).containsExactly("Comment about the class")
        assertThat(result.strings).containsExactly("test")
    }

    @Test
    fun `should provide access via extractedTexts list`() {
        // Arrange
        val code = """
            # Comment
            class Foo
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.extractedTexts.map { it.context }).containsExactly(
            ExtractionContext.COMMENT,
            ExtractionContext.IDENTIFIER
        )
    }

    // === Import String Tests ===

    @Test
    fun `should not extract require path strings`() {
        // Arrange
        val code = """
            require 'json'
            require "yaml"
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.strings).isEmpty()
    }

    @Test
    fun `should not extract require_relative path strings`() {
        // Arrange
        val code = """
            require_relative 'helper'
            require_relative "./lib/utils"
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.strings).isEmpty()
    }

    @Test
    fun `should not extract load path strings`() {
        // Arrange
        val code = """load 'config.rb'"""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.strings).isEmpty()
    }

    @Test
    fun `should still extract regular strings alongside requires`() {
        // Arrange
        val code = """
            require 'json'
            message = "Hello World"
            greeting = 'Welcome'
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.strings).containsExactly("Hello World", "Welcome")
    }

    @Test
    fun `should handle mixed requires and regular strings`() {
        // Arrange
        val code = """
            require 'json'
            require_relative 'helper'
            APP_NAME = "MyApp"
            load 'config.rb'
            VERSION = '1.0.0'
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.strings).containsExactly("MyApp", "1.0.0")
    }

    // === API Tests ===

    @Test
    fun `should report extraction is supported for Ruby`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.RUBY)).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".rb")).isTrue()
    }

    @Test
    fun `should return Ruby in supported languages`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.RUBY)).isTrue()
    }

    @Test
    fun `should return rb in supported extensions`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(".rb")).isTrue()
    }

    // === Rescue Exception Variable Tests ===

    @Test
    fun `should extract rescue exception variable`() {
        // Arrange
        val code = """
            begin
              risky
            rescue StandardError => e
              log(e)
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("e")
    }

    @Test
    fun `should extract rescue exception variable with different name`() {
        // Arrange
        val code = """
            begin
              operation
            rescue => error
              handle(error)
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("error")
    }

    // === Attr Accessor Tests ===

    @Test
    fun `should extract attr_reader names`() {
        // Arrange
        val code = """
            class User
              attr_reader :name, :email
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("User", "name", "email")
    }

    @Test
    fun `should extract attr_writer names`() {
        // Arrange
        val code = """
            class User
              attr_writer :password
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("User", "password")
    }

    @Test
    fun `should extract attr_accessor names`() {
        // Arrange
        val code = """
            class User
              attr_accessor :status
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("User", "status")
    }

    // === Alias Tests ===

    @Test
    fun `should extract alias method names`() {
        // Arrange
        val code = "alias new_method old_method"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("new_method", "old_method")
    }

    // === For Loop Tests ===

    @Test
    fun `should extract for loop variable`() {
        // Arrange
        val code = """
            for item in collection
              puts item
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("item")
    }

    // === Multiple Block Parameters Tests ===

    @Test
    fun `should extract multiple block parameters`() {
        // Arrange
        val code = "hash.each { |key, value| puts key }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("key", "value")
    }

    // === Multiple Assignment Tests ===

    @Test
    fun `should extract multiple assignment variables`() {
        // Arrange
        val code = "a, b, c = 1, 2, 3"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("a", "b", "c")
    }

    @Test
    fun `should extract splat in multiple assignment`() {
        // Arrange
        val code = "first, *rest = array"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("first", "rest")
    }

    // === Pattern Matching Tests (Ruby 3+) ===

    @Test
    fun `should extract pattern matching variables from hash pattern`() {
        // Arrange
        val code = """
            case response
            in { status: status_val, data: data_val }
              process(status_val, data_val)
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("status_val", "data_val")
    }

    @Test
    fun `should extract pattern matching variables from array pattern`() {
        // Arrange
        val code = """
            case items
            in [first, *rest]
              handle(first, rest)
            end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("first", "rest")
    }

    // === Hash Symbol Key Tests ===

    @Test
    fun `should extract hash symbol keys`() {
        // Arrange
        val code = "config = { timeout: 30, retry: true }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("config", "timeout", "retry")
    }

    // === Complex Symbol Tests ===

    @Test
    fun `should extract complex symbol content`() {
        // Arrange
        val code = """status = :"dynamic-symbol""""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.strings).containsExactly("dynamic-symbol")
    }

    // === Lambda Parameter Tests ===

    @Test
    fun `should extract lambda parameters with arrow syntax`() {
        // Arrange
        val code = "multiply = ->(x, y) { x * y }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("multiply", "x", "y")
    }

    @Test
    fun `should extract lambda parameters with lambda keyword`() {
        // Arrange
        val code = "process = lambda { |item| item.process }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.RUBY)

        // Assert
        assertThat(result.identifiers).containsExactly("process", "item")
    }
}
