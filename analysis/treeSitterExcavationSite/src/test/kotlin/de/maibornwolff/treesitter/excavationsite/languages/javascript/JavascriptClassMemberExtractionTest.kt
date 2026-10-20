package de.maibornwolff.treesitter.excavationsite.languages.javascript

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class JavascriptClassMemberExtractionTest {
    @Nested
    inner class GetterSetterStaticTests {
        @Test
        fun `should extract getter name`() {
            // Arrange
            val code = """
                class User {
                    get name() { return this._name; }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("User", "name")
        }

        @Test
        fun `should extract setter name`() {
            // Arrange
            val code = """
                class User {
                    set name(value) { this._name = value; }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("User", "name")
        }

        @Test
        fun `should extract both getter and setter`() {
            // Arrange
            val code = """
                class User {
                    get name() { return this._name; }
                    set name(value) { this._name = value; }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("User", "name", "name")
        }

        @Test
        fun `should extract static method name`() {
            // Arrange
            val code = """
                class Math {
                    static sqrt(x) { return x; }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Math", "sqrt")
        }

        @Test
        fun `should extract static field name`() {
            // Arrange
            val code = """
                class Math {
                    static PI = 3.14159;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Math", "PI")
        }

        @Test
        fun `should extract static and instance members together`() {
            // Arrange
            val code = """
                class Counter {
                    static count = 0;
                    value = 0;

                    static increment() { Counter.count++; }
                    getValue() { return this.value; }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Counter", "count", "value", "increment", "getValue")
        }
    }

    @Nested
    inner class PrivateFieldTests {
        @Test
        fun `should extract private field name`() {
            // Arrange
            val code = """
                class User {
                    #id;
                    #name = "default";
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("User", "id", "name")
        }

        @Test
        fun `should extract private method name`() {
            // Arrange
            val code = """
                class Validator {
                    #validate() { return true; }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Validator", "validate")
        }

        @Test
        fun `should extract mixed private and public members`() {
            // Arrange
            val code = """
                class Account {
                    #balance = 0;
                    name;

                    #updateBalance() { }
                    getBalance() { return this.#balance; }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Account", "balance", "name", "updateBalance", "getBalance")
        }
    }

    @Nested
    inner class EdgeCaseTests {
        @Test
        fun `should handle decorator with member expression`() {
            // @Foo.Bar style decorators - only class name is extracted
            val code = """
                @Ng.Component()
                class MyComponent { }
            """.trimIndent()
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)
            // Note: Member expression decorators like @Ng.Component() don't extract the Ng part
            assertThat(result.identifiers).containsExactly("MyComponent")
        }

        @Test
        fun `should handle property decorator`() {
            val code = """
                class MyClass {
                    @Input()
                    myProperty: string;
                }
            """.trimIndent()
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)
            // Note: Property decorators like @Input() are not extracted, only class/method/accessor decorators
            assertThat(result.identifiers).containsExactly("MyClass", "myProperty")
        }

        @Test
        fun `should handle class with multiple decorated methods`() {
            val code = """
                class Controller {
                    @Get('/users')
                    getUsers() { }

                    @Post('/users')
                    @Validate()
                    createUser() { }
                }
            """.trimIndent()
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)
            assertThat(result.identifiers).containsExactly(
                "Controller",
                "Get",
                "getUsers",
                "Post",
                "Validate",
                "createUser"
            )
        }

        @Test
        fun `should extract static private field`() {
            val code = """
                class Counter {
                    static #count = 0;
                    static #increment() { Counter.#count++; }
                }
            """.trimIndent()
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("Counter", "count", "increment")
        }

        @Test
        fun `should extract private getter and setter`() {
            val code = """
                class Box {
                    #value = 0;
                    get #secret() { return this.#value; }
                    set #secret(v) { this.#value = v; }
                }
            """.trimIndent()
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("Box", "value", "secret", "secret")
        }

        @Test
        fun `should handle class with only private members`() {
            val code = """
                class Private {
                    #a;
                    #b;
                    #method() { }
                }
            """.trimIndent()
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("Private", "a", "b", "method")
        }
    }
}
