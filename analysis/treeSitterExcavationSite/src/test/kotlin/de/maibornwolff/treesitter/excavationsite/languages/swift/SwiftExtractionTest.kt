package de.maibornwolff.treesitter.excavationsite.languages.swift

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class SwiftExtractionTest {
    // === Identifier Extraction Tests ===

    @Test
    fun `should extract class declaration identifier`() {
        // Arrange
        val code = "class UserService {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("UserService")
    }

    @Test
    fun `should extract struct declaration identifier`() {
        // Arrange
        val code = "struct Point {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("Point")
    }

    @Test
    fun `should extract protocol declaration identifier`() {
        // Arrange
        val code = "protocol Printable {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("Printable")
    }

    @Test
    fun `should extract enum declaration identifier`() {
        // Arrange
        val code = "enum Status {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("Status")
    }

    @Test
    fun `should extract enum case identifiers`() {
        // Arrange
        val code = """
            enum Status {
                case pending
                case active
                case completed
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("Status", "pending", "active", "completed")
    }

    @Test
    fun `should extract function declaration identifier`() {
        // Arrange
        val code = "func processOrder() {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("processOrder")
    }

    @Test
    fun `should extract init declaration`() {
        // Arrange
        val code = """
            class User {
                init(name: String) {}
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("User", "init", "name")
    }

    @Test
    fun `should extract property declaration identifier`() {
        // Arrange
        val code = """
            class User {
                var customerName: String = ""
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("User", "customerName")
    }

    @Test
    fun `should extract constant declaration identifier`() {
        // Arrange
        val code = """
            class Config {
                let maxSize = 100
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("Config", "maxSize")
    }

    @Test
    fun `should extract parameter internal name`() {
        // Arrange
        val code = "func greet(person name: String) {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("greet", "name")
    }

    @Test
    fun `should extract parameter when single name`() {
        // Arrange
        val code = "func add(a: Int, b: Int) -> Int { return a + b }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("add", "a", "b")
    }

    @Test
    fun `should extract typealias identifier`() {
        // Arrange
        val code = "typealias UserId = String"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("UserId")
    }

    @Test
    fun `should extract associatedtype identifier`() {
        // Arrange
        val code = """
            protocol Container {
                associatedtype Item
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("Container", "Item")
    }

    @Test
    fun `should extract identifiers from complex type`() {
        // Arrange
        val code = """
            class OrderProcessor {
                var status: String = "pending"

                func processOrder(customerId: String) {
                    let result = validate()
                }

                private func validate() -> Bool {
                    return true
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "OrderProcessor",
            "status",
            "processOrder",
            "customerId",
            "result",
            "validate"
        )
    }

    @Test
    fun `should handle empty source code`() {
        // Arrange
        val code = ""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).isEmpty()
        assertThat(result.comments).isEmpty()
        assertThat(result.strings).isEmpty()
    }

    @Test
    fun `should extract identifiers from struct with properties`() {
        // Arrange
        val code = """
            struct User {
                var userId: String
                var userName: String
                let userEmail: String
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("User", "userId", "userName", "userEmail")
    }

    @Test
    fun `should extract identifiers from enum with associated values`() {
        // Arrange
        val code = """
            enum Result {
                case success(data: String)
                case failure(error: Error)
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("Result", "success", "data", "failure", "error")
    }

    @Test
    fun `should extract identifiers from protocol with requirements`() {
        // Arrange
        val code = """
            protocol Repository {
                associatedtype Entity
                func save(_ entity: Entity)
                func findById(id: String) -> Entity?
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "Repository",
            "Entity",
            "save",
            "entity",
            "findById",
            "id"
        )
    }

    @Test
    fun `should extract identifiers from extension`() {
        // Arrange
        val code = """
            extension User {
                func validate() -> Bool {
                    return true
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("User", "validate")
    }

    @Test
    fun `should extract extension type name with constraints`() {
        // Arrange
        val code = """
            extension Array where Element: Comparable {
                func sorted() -> [Element] { self }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("Array", "sorted")
    }

    @Test
    fun `should extract closure parameters with types`() {
        // Arrange
        val code = "let multiply = { (x: Int, y: Int) in x * y }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("multiply", "x", "y")
    }

    @Test
    fun `should extract closure parameters without types`() {
        // Arrange
        val code = "numbers.map { item in item * 2 }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("item")
    }

    @Test
    fun `should not extract shorthand closure arguments`() {
        // Arrange
        val code = "numbers.filter { $0 > 5 }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert - $0 should NOT be extracted
        assertThat(result.identifiers).isEmpty()
    }

    @Test
    fun `should extract generic type parameters from struct`() {
        // Arrange
        val code = "struct Stack<Element> { var items: [Element] = [] }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("Stack", "Element", "items")
    }

    @Test
    fun `should extract generic type parameters from function`() {
        // Arrange
        val code = "func swap<T>(_ a: inout T, _ b: inout T) {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("swap", "T", "a", "b")
    }

    @Test
    fun `should extract multiple generic type parameters`() {
        // Arrange
        val code = "class Container<Key, Value> {}"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("Container", "Key", "Value")
    }

    @Test
    fun `should extract guard let variable`() {
        // Arrange
        val code = """
            func process() {
                guard let user = getUser() else { return }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("process", "user")
    }

    @Test
    fun `should extract if let variable`() {
        // Arrange
        val code = """
            if let name = user.name {
                print(name)
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("name")
    }

    @Test
    fun `should extract subscript declaration`() {
        // Arrange
        val code = """
            struct Matrix {
                subscript(index: Int) -> Int { return 0 }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("Matrix", "subscript", "index")
    }

    @Test
    fun `should extract deinit declaration`() {
        // Arrange
        val code = """
            class Resource {
                deinit { cleanup() }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("Resource", "deinit")
    }

    @Test
    fun `should extract protocol property requirements`() {
        // Arrange
        val code = """
            protocol Named {
                var name: String { get }
                var id: Int { get set }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("Named", "name", "id")
    }

    // === Edge Case Tests ===

    @Test
    fun `should extract extension with protocol conformance`() {
        // Arrange
        val code = """
            extension String: CustomStringConvertible {
                var description: String { self }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("String", "description")
    }

    @Test
    fun `should extract multiple closure parameters`() {
        // Arrange
        val code = "let reduce = { (acc: Int, next: Int, index: Int) in acc + next }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("reduce", "acc", "next", "index")
    }

    @Test
    fun `should extract nested closures`() {
        // Arrange
        val code = """
            let outer = { (x: Int) in
                let inner = { (y: Int) in y * 2 }
                return inner(x)
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("outer", "x", "inner", "y")
    }

    @Test
    fun `should extract generic with constraint`() {
        // Arrange
        val code = "func compare<T: Comparable>(_ a: T, _ b: T) -> Bool { a < b }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("compare", "T", "a", "b")
    }

    @Test
    fun `should extract multiple guard let bindings`() {
        // Arrange
        val code = """
            func process() {
                guard let a = getA(), let b = getB() else { return }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("process", "a", "b")
    }

    @Test
    fun `should extract subscript with multiple parameters`() {
        // Arrange
        val code = """
            struct Grid {
                subscript(row: Int, col: Int) -> Int { return 0 }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("Grid", "subscript", "row", "col")
    }

    @Test
    fun `should extract if let in else if chain`() {
        // Arrange
        val code = """
            if let first = a {
                print(first)
            } else if let second = b {
                print(second)
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("first", "second")
    }

    @Test
    fun `should extract generic protocol with associated type constraint`() {
        // Arrange
        val code = """
            protocol Container {
                associatedtype Item: Equatable
                func add(_ item: Item)
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("Container", "Item", "add", "item")
    }

    @Test
    fun `should extract class with init deinit and subscript`() {
        // Arrange
        val code = """
            class Cache {
                init(size: Int) {}
                deinit { cleanup() }
                subscript(key: String) -> Any? { return nil }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("Cache", "init", "size", "deinit", "subscript", "key")
    }

    @Test
    fun `should handle guard var binding`() {
        // Arrange
        val code = """
            func modify() {
                guard var value = getValue() else { return }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("modify", "value")
    }

    @Test
    fun `should extract nested generic types`() {
        // Arrange
        val code = "struct Wrapper<T, U> { var first: T; var second: U }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("Wrapper", "T", "U", "first", "second")
    }

    @Test
    fun `should handle trailing closure without parameters`() {
        // Arrange
        val code = "DispatchQueue.main.async { print(\"done\") }"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert - no identifiers from closure, just the string
        assertThat(result.identifiers).isEmpty()
        assertThat(result.strings).containsExactly("done")
    }

    @Test
    fun `should extract static protocol property`() {
        // Arrange
        val code = """
            protocol Identifiable {
                static var defaultId: String { get }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("Identifiable", "defaultId")
    }

    @Test
    fun `should extract extension with where clause`() {
        // Arrange
        val code = """
            extension Collection where Element == String {
                func joined() -> String { "" }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("Collection", "joined")
    }

    // === Comment Extraction Tests ===

    @Test
    fun `should extract single line comment`() {
        // Arrange
        val code = """
            // This is a comment
            let x = 1
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.comments).containsExactly("This is a comment")
    }

    @Test
    fun `should extract multiline comment`() {
        // Arrange
        val code = """
            /*
             * This is a
             * multiline comment
             */
            let x = 1
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.comments).containsExactly("This is a\nmultiline comment")
    }

    @Test
    fun `should extract doc comment`() {
        // Arrange
        val code = """
            /// Documentation for the function
            func process() {}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.comments).containsExactly("Documentation for the function")
    }

    @Test
    fun `should extract multiple comments`() {
        // Arrange
        val code = """
            // First comment
            let x = 1
            // Second comment
            let y = 2
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.comments).containsExactly("First comment", "Second comment")
    }

    // === String Extraction Tests ===

    @Test
    fun `should extract string literal`() {
        // Arrange
        val code = """let message = "Hello World""""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.strings).containsExactly("Hello World")
    }

    @Test
    fun `should extract multiline string literal`() {
        // Arrange
        val code = """
            let multiline = ${"\"\"\""}
            This is a
            multiline string
            ${"\"\"\""}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.strings).containsExactly("\nThis is a\nmultiline string\n")
    }

    @Test
    fun `should extract multiple strings`() {
        // Arrange
        val code = """
            let first = "Hello"
            let second = "World"
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.strings).containsExactly("Hello", "World")
    }

    @Test
    fun `should extract regex literal`() {
        // Arrange
        val code = "let pattern = /[a-z]+/"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.strings).containsExactly("[a-z]+")
    }

    // === ExtractionResult Tests ===

    @Test
    fun `should correctly categorize extracted items by context`() {
        // Arrange
        val code = """
            // Comment about the class
            class Example {
                let name = "test"
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.identifiers).containsExactly("Example", "name")
        assertThat(result.comments).containsExactly("Comment about the class")
        assertThat(result.strings).containsExactly("test")
    }

    @Test
    fun `should provide access via extractedTexts list`() {
        // Arrange
        val code = """
            // Comment
            class Foo {}
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SWIFT)

        // Assert
        assertThat(result.extractedTexts.map { it.context }).containsExactly(
            ExtractionContext.COMMENT,
            ExtractionContext.IDENTIFIER
        )
    }

    // === API Tests ===

    @Test
    fun `should report extraction is supported for Swift`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.SWIFT)).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".swift")).isTrue()
    }

    @Test
    fun `should return Swift in supported languages`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.SWIFT)).isTrue()
    }

    @Test
    fun `should return swift in supported extensions`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(".swift")).isTrue()
    }
}
