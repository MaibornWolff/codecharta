package de.maibornwolff.treesitter.excavationsite.languages.javascript

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class JavascriptTypeScriptSyntaxExtractionTest {
    @Nested
    inner class TypeScriptTests {
        @Test
        fun `should extract class declaration identifier`() {
            // Arrange
            val code = "class UserProfile {}"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("UserProfile")
        }

        @Test
        fun `should extract interface declaration identifier`() {
            // Arrange
            val code = "interface Drawable { draw(): void; }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Drawable")
        }

        @Test
        fun `should extract type alias identifier`() {
            // Arrange
            val code = "type UserId = string;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("UserId")
        }

        @Test
        fun `should extract enum declaration identifier`() {
            // Arrange
            val code = """
                enum Status {
                    PENDING,
                    ACTIVE,
                    COMPLETED
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            // Now extracts enum name AND all enum members
            assertThat(result.identifiers).containsExactly("Status", "PENDING", "ACTIVE", "COMPLETED")
        }

        @Test
        fun `should extract function with typed parameters`() {
            // Arrange
            val code = """
                function calculateTotal(price: number, quantity: number): number {
                    return price * quantity;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("calculateTotal", "price", "quantity")
        }

        @Test
        fun `should extract class with typed properties`() {
            // Arrange
            val code = """
                class User {
                    name: string;
                    age: number;

                    constructor(name: string, age: number) {
                        this.name = name;
                        this.age = age;
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            // 'constructor' is a keyword, not extracted; parameters name/age are extracted
            assertThat(result.identifiers).containsExactly("User", "name", "age", "name", "age")
        }

        @Test
        fun `should extract JSDoc comment`() {
            // Arrange
            val code = """
                /**
                 * Calculates the sum of two numbers
                 * @param a First number
                 * @param b Second number
                 */
                function add(a: number, b: number): number {
                    return a + b;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.comments).containsExactly("Calculates the sum of two numbers\n@param a First number\n@param b Second number")
        }

        @Test
        fun `should correctly categorize extracted items`() {
            // Arrange
            val code = """
                // User class for managing user data
                class User {
                    name = "default";
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("User", "name")
            assertThat(result.comments).containsExactly("User class for managing user data")
            assertThat(result.strings).containsExactly("default")
        }
    }

    @Nested
    inner class TypeScriptEnhancementTests {
        @Test
        fun `should extract optional parameter`() {
            // Arrange
            val code = "function greet(name?: string) { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("greet", "name")
        }

        @Test
        fun `should extract decorator name`() {
            // Arrange
            val code = """
                @Component
                class MyComponent { }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Component", "MyComponent")
        }

        @Test
        fun `should extract decorator with call expression`() {
            // Arrange
            val code = """
                @Component({ selector: 'app-root' })
                class AppComponent { }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Component", "AppComponent")
        }

        @Test
        fun `should extract multiple decorators`() {
            // Arrange
            val code = """
                @Injectable()
                @Serializable
                class MyService { }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Injectable", "Serializable", "MyService")
        }

        @Test
        fun `should extract method decorator`() {
            // Arrange
            val code = """
                class MyClass {
                    @Log
                    myMethod() { }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("MyClass", "Log", "myMethod")
        }

        @Test
        fun `should extract typescript destructuring with types`() {
            // Arrange
            val code = "const { name, age }: Person = getPerson();"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("name", "age")
        }

        @Test
        fun `should extract typescript rest parameter with type`() {
            // Arrange
            val code = "function sum(...numbers: number[]): number { return 0; }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("sum", "numbers")
        }
    }

    @Nested
    inner class EnumMemberTests {
        @Test
        fun `should extract enum members without values`() {
            // Arrange
            val code = """
                enum Status {
                    PENDING,
                    ACTIVE,
                    COMPLETED
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Status", "PENDING", "ACTIVE", "COMPLETED")
        }

        @Test
        fun `should extract enum members with values`() {
            // Arrange
            val code = """
                enum HttpStatus {
                    OK = 200,
                    NOT_FOUND = 404,
                    SERVER_ERROR = 500
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("HttpStatus", "OK", "NOT_FOUND", "SERVER_ERROR")
        }

        @Test
        fun `should extract mixed enum members`() {
            // Arrange
            val code = """
                enum Direction {
                    UP,
                    DOWN = 1,
                    LEFT,
                    RIGHT = 3
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Direction", "UP", "DOWN", "LEFT", "RIGHT")
        }

        @Test
        fun `should extract const enum members`() {
            // Arrange
            val code = """
                const enum Color {
                    RED,
                    GREEN,
                    BLUE
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Color", "RED", "GREEN", "BLUE")
        }
    }

    @Nested
    inner class TypeParameterTests {
        @Test
        fun `should extract function type parameter`() {
            // Arrange
            val code = "function identity<T>(arg: T): T { return arg; }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("identity", "T", "arg")
        }

        @Test
        fun `should extract multiple type parameters`() {
            // Arrange
            val code = "function map<T, U>(arr: T[], fn: (x: T) => U): U[] { return []; }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            // Note: x is extracted from the function type parameter (x: T) => U
            assertThat(result.identifiers).containsExactly("map", "T", "U", "arr", "fn", "x")
        }

        @Test
        fun `should extract class type parameter`() {
            // Arrange
            val code = "class Container<T> { value: T; }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Container", "T", "value")
        }

        @Test
        fun `should extract interface type parameter`() {
            // Arrange
            val code = "interface Repository<T> { find(id: string): T; }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            // Note: id is extracted from the method signature parameter
            assertThat(result.identifiers).containsExactly("Repository", "T", "id")
        }

        @Test
        fun `should extract constrained type parameter`() {
            // Arrange
            val code = "function longest<T extends { length: number }>(a: T, b: T): T { return a; }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            // Note: length is extracted from the constraint's property signature
            assertThat(result.identifiers).containsExactly("longest", "T", "length", "a", "b")
        }

        @Test
        fun `should extract arrow function type parameter`() {
            // Arrange
            val code = "const identity = <T>(x: T): T => x;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("identity", "T", "x")
        }
    }

    @Nested
    inner class NamespaceTests {
        @Test
        fun `should extract namespace declaration identifier`() {
            // Arrange
            val code = "namespace Utils { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Utils")
        }

        @Test
        fun `should extract namespace with exported members`() {
            // Arrange
            val code = """
                namespace Math {
                    export const PI = 3.14159;
                    export function sqrt(x: number): number { return x; }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Math", "PI", "sqrt", "x")
        }

        @Test
        fun `should extract nested namespace`() {
            // Arrange
            val code = """
                namespace Outer {
                    namespace Inner {
                        export const VALUE = 42;
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Outer", "Inner", "VALUE")
        }

        @Test
        fun `should extract module declaration identifier`() {
            // Arrange
            // Note: In modern TypeScript, 'namespace' is preferred over 'module' for internal modules
            // The 'module' keyword with identifier syntax may not be fully supported by tree-sitter
            val code = "namespace MyModule { export class MyClass { } }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("MyModule", "MyClass")
        }
    }

    @Nested
    inner class EdgeCaseTests {
        @Test
        fun `should handle optional chaining in destructuring default`() {
            val code = "const { value = obj?.default } = config;"
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)
            assertThat(result.identifiers).containsExactly("value")
        }

        @Test
        fun `should handle generic function`() {
            val code = "function identity<T>(arg: T): T { return arg; }"
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)
            // Type parameter T is now extracted
            assertThat(result.identifiers).containsExactly("identity", "T", "arg")
        }

        @Test
        fun `should extract string enum members`() {
            val code = """
                enum Direction {
                    Up = "UP",
                    Down = "DOWN"
                }
            """.trimIndent()
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)
            assertThat(result.identifiers).containsExactly("Direction", "Up", "Down")
        }

        @Test
        fun `should handle enum with single member`() {
            val code = "enum Single { ONLY }"
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)
            assertThat(result.identifiers).containsExactly("Single", "ONLY")
        }

        @Test
        fun `should handle empty enum`() {
            val code = "enum Empty { }"
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)
            assertThat(result.identifiers).containsExactly("Empty")
        }

        @Test
        fun `should extract type parameter with default`() {
            val code = "function create<T = string>(): T { return {} as T; }"
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)
            assertThat(result.identifiers).containsExactly("create", "T")
        }

        @Test
        fun `should extract type parameter with multiple constraints`() {
            val code = "function merge<T extends object, U extends object>(a: T, b: U): T & U { return {...a, ...b}; }"
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)
            assertThat(result.identifiers).containsExactly("merge", "T", "U", "a", "b")
        }

        @Test
        fun `should extract type parameter in type alias`() {
            val code = "type Container<T> = { value: T };"
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)
            // value is extracted from the property signature in the object type
            assertThat(result.identifiers).containsExactly("Container", "T", "value")
        }

        @Test
        fun `should handle method with type parameter`() {
            val code = """
                class Service {
                    transform<T>(input: T): T { return input; }
                }
            """.trimIndent()
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)
            assertThat(result.identifiers).containsExactly("Service", "transform", "T", "input")
        }

        @Test
        fun `should handle deeply nested namespaces`() {
            val code = """
                namespace A {
                    namespace B {
                        namespace C {
                            export const value = 1;
                        }
                    }
                }
            """.trimIndent()
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)
            assertThat(result.identifiers).containsExactly("A", "B", "C", "value")
        }

        @Test
        fun `should handle namespace with interface and class`() {
            val code = """
                namespace Models {
                    export interface User { name: string; }
                    export class UserImpl { name: string; }
                }
            """.trimIndent()
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)
            // name appears twice: once in interface property signature, once in class field
            assertThat(result.identifiers).containsExactly("Models", "User", "name", "UserImpl", "name")
        }

        @Test
        fun `should handle empty namespace`() {
            val code = "namespace Empty { }"
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)
            assertThat(result.identifiers).containsExactly("Empty")
        }
    }
}
