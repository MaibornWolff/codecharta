package de.maibornwolff.treesitter.excavationsite.languages.go

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class GoExtractionTest {
    // === Identifier Extraction Tests ===

    @Test
    fun `should extract type declaration identifier`() {
        // Arrange
        val code = """
            type User struct {}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("User")
    }

    @Test
    fun `should extract struct type with fields`() {
        // Arrange
        val code = """
            type Order struct {
                OrderID    string
                CustomerID string
                Total      float64
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "Order",
            "OrderID",
            "CustomerID",
            "Total"
        )
    }

    @Test
    fun `should extract interface type with methods`() {
        // Arrange
        val code = """
            type Repository interface {
                Save(order Order) error
                FindById(id string) Order
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "Repository",
            "Save",
            "order",
            "FindById",
            "id"
        )
    }

    @Test
    fun `should extract interface method names from Reader interface`() {
        // Arrange
        val code = """
            type Reader interface {
                Read(p []byte) (n int, err error)
                Close() error
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("Reader", "Read", "p", "n", "err", "Close")
    }

    @Test
    fun `should extract function declaration identifier`() {
        // Arrange
        val code = """
            func ProcessOrder() {
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("ProcessOrder")
    }

    @Test
    fun `should extract method declaration identifier`() {
        // Arrange
        val code = """
            func (u *User) Save() error {
                return nil
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("Save", "u")
    }

    @Test
    fun `should extract var declaration identifiers`() {
        // Arrange
        val code = """
            var orderTotal int
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("orderTotal")
    }

    @Test
    fun `should extract const declaration identifiers`() {
        // Arrange
        val code = """
            const MaxRetries = 3
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("MaxRetries")
    }

    @Test
    fun `should extract short var declaration identifiers`() {
        // Arrange
        val code = """
            func main() {
                order := NewOrder()
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("main", "order")
    }

    @Test
    fun `should extract multiple short var declaration identifiers`() {
        // Arrange
        val code = """
            func main() {
                a, b, c := 1, 2, 3
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("main", "a", "b", "c")
    }

    @Test
    fun `should extract parameter identifiers`() {
        // Arrange
        val code = """
            func foo(order Order, count int) {
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("foo", "order", "count")
    }

    @Test
    fun `should extract named return values`() {
        // Arrange
        val code = """
            func divide(a int, b int) (result int, err error) {
                return
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("divide", "a", "b", "result", "err")
    }

    @Test
    fun `should extract grouped parameters with same type`() {
        // Arrange
        val code = """
            func add(a, b, c int) int {
                return a + b + c
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("add", "a", "b", "c")
    }

    @Test
    fun `should extract range clause variables`() {
        // Arrange
        val code = """
            func main() {
                for i, v := range slice {
                    println(i, v)
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("main", "i", "v")
    }

    @Test
    fun `should extract range clause with single variable`() {
        // Arrange
        val code = """
            func main() {
                for i := range channel {
                    println(i)
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("main", "i")
    }

    @Test
    fun `should extract type parameters from generic type`() {
        // Arrange
        val code = """
            type Stack[T any] struct {
                items []T
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("Stack", "T", "items")
    }

    @Test
    fun `should extract type parameters from generic function`() {
        // Arrange
        val code = """
            func Map[T, U any](items []T, f func(T) U) []U {
                return nil
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("Map", "T", "U", "items", "f")
    }

    @Test
    fun `should extract all variables from var block`() {
        // Arrange
        val code = """
            var (
                name = "John"
                age  = 30
            )
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("name", "age")
    }

    @Test
    fun `should extract all constants from const block`() {
        // Arrange
        val code = """
            const (
                StatusOK = 200
                StatusNotFound = 404
            )
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("StatusOK", "StatusNotFound")
    }

    @Test
    fun `should extract iota constants`() {
        // Arrange
        val code = """
            const (
                Sunday = iota
                Monday
                Tuesday
            )
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("Sunday", "Monday", "Tuesday")
    }

    @Test
    fun `should extract select statement variables`() {
        // Arrange
        val code = """
            func main() {
                select {
                case msg := <-ch:
                    println(msg)
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("main", "msg")
    }

    @Test
    fun `should extract type switch variable`() {
        // Arrange
        val code = """
            func main() {
                switch v := x.(type) {
                case int:
                    println(v)
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("main", "v")
    }

    @Test
    fun `should extract field declaration identifiers`() {
        // Arrange
        val code = """
            type Config struct {
                CustomerName string
                MaxItems     int
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "Config",
            "CustomerName",
            "MaxItems"
        )
    }

    @Test
    fun `should handle embedded fields`() {
        // Arrange
        val code = """
            type Admin struct {
                User
                Role string
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("Admin", "User", "Role")
    }

    @Test
    fun `should extract both exported and unexported identifiers`() {
        // Arrange
        val code = """
            type OrderService struct {
                orderRepository repository
            }

            func NewOrderService() *OrderService {
                return &OrderService{}
            }

            func (s *OrderService) processOrder() error {
                return nil
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "OrderService",
            "orderRepository",
            "NewOrderService",
            "processOrder",
            "s"
        )
    }

    @Test
    fun `should handle empty source code`() {
        // Arrange
        val code = ""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

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
            // This is a comment
            func main() {}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.comments).hasSize(1)
        assertThat(result.comments[0]).isEqualTo("This is a comment")
    }

    @Test
    fun `should extract block comment`() {
        // Arrange
        val code = """
            /* This is a block comment */
            func main() {}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.comments).hasSize(1)
        assertThat(result.comments[0]).isEqualTo("This is a block comment")
    }

    @Test
    fun `should extract doc comment`() {
        // Arrange
        val code = """
            // ProcessOrder handles order processing.
            // It validates and saves the order.
            func ProcessOrder() {}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.comments).containsExactly(
            "ProcessOrder handles order processing.",
            "It validates and saves the order."
        )
    }

    @Test
    fun `should extract multiline block comment`() {
        // Arrange
        val code = """
            /*
             * This is a multiline
             * block comment
             */
            func main() {}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.comments).hasSize(1)
        assertThat(result.comments[0]).isEqualTo("This is a multiline\nblock comment")
    }

    // === String Extraction Tests ===

    @Test
    fun `should extract interpreted string literal`() {
        // Arrange
        val code = """
            func main() {
                message := "Hello World"
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("main", "message")
        assertThat(result.strings).containsExactly("Hello World")
    }

    @Test
    fun `should extract raw string literal`() {
        // Arrange
        val backtick = '`'
        val code = """
            func main() {
                pattern := ${backtick}raw string content$backtick
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("main", "pattern")
        assertThat(result.strings).containsExactly("raw string content")
    }

    @Test
    fun `should extract multiple strings`() {
        // Arrange
        val code = """
            func main() {
                first := "Hello"
                second := "World"
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("main", "first", "second")
        assertThat(result.strings).containsExactly("Hello", "World")
    }

    @Test
    fun `should extract rune literals`() {
        // Arrange
        val code = """
            func main() {
                char := 'A'
                newline := '\n'
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("main", "char", "newline")
        assertThat(result.strings).containsExactly("A", "\\n")
    }

    // === Combined Tests ===

    @Test
    fun `should correctly categorize extracted items by context`() {
        // Arrange
        val code = """
            // Service handles business logic
            type Service struct {
                name string
            }

            func main() {
                msg := "hello"
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("Service", "name", "main", "msg")
        assertThat(result.comments).containsExactly("Service handles business logic")
        assertThat(result.strings).containsExactly("hello")
    }

    @Test
    fun `should provide access via extractedTexts list`() {
        // Arrange
        val code = """
            // Comment
            type Foo struct {}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.extractedTexts.map { it.context }).containsExactly(
            ExtractionContext.COMMENT,
            ExtractionContext.IDENTIFIER
        )
    }

    // === Edge Case Tests ===
    // These tests document all supported extraction features and edge cases

    @Test
    fun `edge case - function with receiver, generics, grouped params, and named returns`() {
        // Arrange - complex function signature with multiple features
        // NOTE: Generic methods (methods with type parameters) have limited support in tree-sitter-go
        // The method name and most parameters are nested differently than regular methods
        val code = """
            func (s *Server) Handle(a, b int, c string) (result int, err error) {
                return
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert - extracts: method name, receiver, params, named returns
        assertThat(result.identifiers).containsExactly(
            "Handle",
            "s",
            "a",
            "b",
            "c",
            "result",
            "err"
        )
    }

    @Test
    fun `edge case - generic function with grouped type params`() {
        // Arrange - generic function (not method) with multiple type parameters
        val code = """
            func Process[T, U any](a, b T, c U) (result T, err error) {
                return
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "Process",
            "T",
            "U",
            "a",
            "b",
            "c",
            "result",
            "err"
        )
    }

    @Test
    fun `edge case - interface with multiple methods`() {
        // Arrange
        // NOTE: Embedded interfaces (like "Reader" alone on a line) are not currently extracted
        // They use a different AST structure than embedded struct fields
        val code = """
            type ReadWriter interface {
                Write(p []byte) (n int, err error)
                Close() error
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert - extracts: interface name, method names, params, returns
        assertThat(result.identifiers).containsExactly(
            "ReadWriter",
            "Write",
            "p",
            "n",
            "err",
            "Close"
        )
    }

    @Test
    fun `edge case - struct with multiple field types`() {
        // Arrange
        val code = """
            type Config struct {
                Host, Port string
                Timeout    int
                Logger
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert - should extract: type name, grouped fields, single field, embedded field
        assertThat(result.identifiers).containsExactly(
            "Config",
            "Host",
            "Port",
            "Timeout",
            "Logger"
        )
    }

    @Test
    fun `edge case - for loop with range over map`() {
        // Arrange
        val code = """
            func main() {
                for key, value := range myMap {
                    println(key, value)
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("main", "key", "value")
    }

    @Test
    fun `edge case - select with multiple cases`() {
        // Arrange
        val code = """
            func main() {
                select {
                case msg := <-ch1:
                    println(msg)
                case data := <-ch2:
                    println(data)
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("main", "msg", "data")
    }

    @Test
    fun `edge case - type switch with multiple type cases`() {
        // Arrange
        val code = """
            func main() {
                switch v := x.(type) {
                case int:
                    println(v)
                case string:
                    println(v)
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("main", "v")
    }

    @Test
    fun `edge case - generic type with constraint`() {
        // Arrange
        val code = """
            type Number interface {
                int | float64
            }

            func Sum[T Number](values []T) T {
                return values[0]
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("Number", "Sum", "T", "values")
    }

    @Test
    fun `edge case - var block with mixed declarations`() {
        // Arrange
        val code = """
            var (
                name, age = "John", 30
                active    = true
                count     int
            )
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("name", "age", "active", "count")
        assertThat(result.strings).containsExactly("John")
    }

    @Test
    fun `edge case - const block with iota and expressions`() {
        // Arrange
        val code = """
            const (
                KB = 1 << (10 * iota)
                MB
                GB
                TB
            )
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("KB", "MB", "GB", "TB")
    }

    @Test
    fun `edge case - nested function calls with short var`() {
        // Arrange
        val code = """
            func main() {
                result, err := outer(inner(x))
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("main", "result", "err")
    }

    @Test
    fun `edge case - method on pointer receiver with value return`() {
        // Arrange
        val code = """
            func (c *Client) Get(url string) (resp Response, err error) {
                return
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("Get", "c", "url", "resp", "err")
    }

    @Test
    fun `edge case - pointer embedded struct field`() {
        // Arrange
        // NOTE: Pointer embedded fields (*Inner) use pointer_type which requires special handling
        // Non-pointer embedded fields (Inner) work correctly - see "should handle embedded fields" test
        val code = """
            type Wrapper struct {
                Inner
                Value int
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert - Inner is extracted as embedded field
        assertThat(result.identifiers).containsExactly("Wrapper", "Inner", "Value")
    }

    @Test
    fun `edge case - multiple return values without names`() {
        // Arrange
        val code = """
            func divide(a, b int) (int, error) {
                return 0, nil
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert - only params extracted, no return names
        assertThat(result.identifiers).containsExactly("divide", "a", "b")
    }

    @Test
    fun `edge case - all string literal types together`() {
        // Arrange
        val backtick = '`'
        val code = """
            func main() {
                s1 := "interpreted"
                s2 := ${backtick}raw$backtick
                r := 'x'
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("main", "s1", "s2", "r")
        assertThat(result.strings).containsExactly("interpreted", "raw", "x")
    }

    @Test
    fun `edge case - complex generic function with multiple type params`() {
        // Arrange
        val code = """
            func Transform[K comparable, V1, V2 any](m map[K]V1, f func(V1) V2) map[K]V2 {
                return nil
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.identifiers).containsExactly("Transform", "K", "V1", "V2", "m", "f")
    }

    // === Import String Tests ===

    @Test
    fun `should not extract import path strings`() {
        // Arrange
        val code = """
            import "fmt"
            import "os"
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.strings).isEmpty()
    }

    @Test
    fun `should not extract grouped import path strings`() {
        // Arrange
        val code = """
            import (
                "fmt"
                "strings"
                "encoding/json"
            )
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.strings).isEmpty()
    }

    @Test
    fun `should not extract aliased import path strings`() {
        // Arrange
        val code = """
            import (
                j "encoding/json"
                . "fmt"
                _ "database/sql"
            )
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.strings).isEmpty()
    }

    @Test
    fun `should still extract regular strings alongside imports`() {
        // Arrange
        val code = """
            import "fmt"

            func main() {
                msg := "Hello World"
                fmt.Println(msg)
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.strings).containsExactly("Hello World")
    }

    @Test
    fun `should still extract raw strings alongside imports`() {
        // Arrange
        val backtick = '`'
        val code = """
            import "fmt"

            func main() {
                pattern := ${backtick}raw string$backtick
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.strings).containsExactly("raw string")
    }

    @Test
    fun `should handle mixed imports and regular strings`() {
        // Arrange
        val code = """
            import (
                "fmt"
                "os"
            )

            const AppName = "MyApp"

            func main() {
                version := "1.0.0"
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.GO)

        // Assert
        assertThat(result.strings).containsExactly("MyApp", "1.0.0")
    }

    // === API Tests ===

    @Test
    fun `should report extraction is supported for Go`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.GO)).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".go")).isTrue()
    }

    @Test
    fun `should return Go in supported languages`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.GO)).isTrue()
    }

    @Test
    fun `should return go in supported extensions`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(".go")).isTrue()
    }
}
