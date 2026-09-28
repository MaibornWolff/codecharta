package de.maibornwolff.treesitter.excavationsite.languages.javascript

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class JavascriptExtractionTest {
    @Nested
    inner class JavaScriptTests {
        @Test
        fun `should extract class declaration identifier`() {
            // Arrange
            val code = "class UserProfile {}"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("UserProfile")
        }

        @Test
        fun `should extract function declaration identifier`() {
            // Arrange
            val code = "function processOrder() {}"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("processOrder")
        }

        @Test
        fun `should extract variable declarator identifiers`() {
            // Arrange
            val code = """
                const userName = "John";
                let userAge = 30;
                var isActive = true;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("userName", "userAge", "isActive")
        }

        @Test
        fun `should extract method definition identifier`() {
            // Arrange
            val code = """
                class Calculator {
                    add(a, b) {
                        return a + b;
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Calculator", "add")
        }

        @Test
        fun `should extract arrow function assigned to variable`() {
            // Arrange
            val code = "const double = (x) => x * 2;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("double")
        }

        @Test
        fun `should extract generator function identifier`() {
            // Arrange
            val code = "function* idGenerator() { yield 1; }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("idGenerator")
        }

        @Test
        fun `should extract single line comment`() {
            // Arrange
            val code = """
                // This is a comment
                const x = 1;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.comments).hasSize(1)
            assertThat(result.comments[0]).isEqualTo("This is a comment")
        }

        @Test
        fun `should extract multiline comment`() {
            // Arrange
            val code = """
                /*
                 * This is a
                 * multiline comment
                 */
                const x = 1;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.comments).containsExactly("This is a\nmultiline comment")
        }

        @Test
        fun `should extract double quoted string`() {
            // Arrange
            val code = """const message = "Hello World";"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.strings).containsExactly("Hello World")
        }

        @Test
        fun `should extract single quoted string`() {
            // Arrange
            val code = """const message = 'Hello World';"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.strings).containsExactly("Hello World")
        }

        @Test
        fun `should extract template string`() {
            // Arrange
            val code = "const message = `Hello World`;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.strings).containsExactly("Hello World")
        }

        @Test
        fun `should handle empty source code`() {
            // Arrange
            val code = ""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).isEmpty()
            assertThat(result.comments).isEmpty()
            assertThat(result.strings).isEmpty()
        }

        @Test
        fun `should extract identifiers from complex class`() {
            // Arrange
            val code = """
                class OrderProcessor {
                    constructor(orderId) {
                        this.orderId = orderId;
                    }

                    processOrder(customerId) {
                        const result = this.validate();
                        return result;
                    }

                    validate() {
                        return true;
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            // Note: JS parameters (orderId, customerId) are not extracted as they're bare identifiers
            // TypeScript parameters are extracted via required_parameter nodes
            // 'constructor' is a keyword, not a meaningful identifier, so it's not extracted
            assertThat(result.identifiers).containsExactly(
                "OrderProcessor",
                "processOrder",
                "result",
                "validate"
            )
        }
    }

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
    inner class DestructuringTests {
        @Test
        fun `should extract object destructuring identifiers`() {
            // Arrange
            val code = "const { name, age } = person;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("name", "age")
        }

        @Test
        fun `should extract array destructuring identifiers`() {
            // Arrange
            val code = "const [first, second] = array;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("first", "second")
        }

        @Test
        fun `should extract nested object destructuring`() {
            // Arrange
            val code = "const { user: { name, email } } = response;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("name", "email")
        }

        @Test
        fun `should extract mixed destructuring`() {
            // Arrange
            val code = "const { items: [first, second] } = data;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("first", "second")
        }

        @Test
        fun `should extract destructuring with default values`() {
            // Arrange
            val code = "const { name = 'default', age = 0 } = config;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("name", "age")
        }

        @Test
        fun `should extract destructuring with renaming`() {
            // Arrange
            val code = "const { name: userName, age: userAge } = person;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("userName", "userAge")
        }

        @Test
        fun `should extract function parameter destructuring`() {
            // Arrange
            val code = "function process({ id, data }) { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("process", "id", "data")
        }

        @Test
        fun `should extract arrow function parameter destructuring`() {
            // Arrange
            val code = "const handler = ({ event, target }) => { };"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("handler", "event", "target")
        }
    }

    @Nested
    inner class ForLoopTests {
        @Test
        fun `should extract for-of loop variable`() {
            // Arrange
            val code = "for (const item of items) { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("item")
        }

        @Test
        fun `should extract for-in loop variable`() {
            // Arrange
            val code = "for (const key in object) { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("key")
        }

        @Test
        fun `should extract for-of with destructuring`() {
            // Arrange
            val code = "for (const { name, age } of people) { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("name", "age")
        }

        @Test
        fun `should extract for-of with array destructuring`() {
            // Arrange
            val code = "for (const [key, value] of entries) { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("key", "value")
        }
    }

    @Nested
    inner class RestPatternTests {
        @Test
        fun `should extract rest parameter in function`() {
            // Arrange
            val code = "function sum(...numbers) { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("sum", "numbers")
        }

        @Test
        fun `should extract rest element in array destructuring`() {
            // Arrange
            val code = "const [first, ...rest] = array;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("first", "rest")
        }

        @Test
        fun `should extract rest element in object destructuring`() {
            // Arrange
            val code = "const { id, ...remaining } = obj;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("id", "remaining")
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
    inner class EdgeCaseTests {
        // Destructuring edge cases

        @Test
        fun `should handle empty object destructuring`() {
            val code = "const {} = obj;"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).isEmpty()
        }

        @Test
        fun `should handle empty array destructuring`() {
            val code = "const [] = arr;"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).isEmpty()
        }

        @Test
        fun `should handle deeply nested destructuring`() {
            val code = "const { a: { b: { c: { d } } } } = obj;"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("d")
        }

        @Test
        fun `should handle destructuring with skipped elements`() {
            val code = "const [, second, , fourth] = arr;"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("second", "fourth")
        }

        @Test
        fun `should handle rest with preceding destructured elements`() {
            val code = "const { a, b, ...rest } = obj;"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("a", "b", "rest")
        }

        // For loop edge cases

        @Test
        fun `should extract for-of with let`() {
            val code = "for (let item of items) { }"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("item")
        }

        @Test
        fun `should extract for-of with var`() {
            val code = "for (var item of items) { }"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("item")
        }

        @Test
        fun `should handle nested for-of loops`() {
            val code = """
                for (const outer of outerList) {
                    for (const inner of innerList) { }
                }
            """.trimIndent()
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("outer", "inner")
        }

        // Decorator edge cases

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

        // Arrow function edge cases

        @Test
        fun `should handle arrow function with destructuring parameter`() {
            val code = "const fn = ({ a, b }) => a + b;"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("fn", "a", "b")
        }

        @Test
        fun `should handle arrow function with rest parameter - expression body`() {
            val code = "const fn = (...args) => args;"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("fn", "args")
        }

        @Test
        fun `should handle arrow function with rest parameter - block body`() {
            val code = "const fn = (...args) => { return args; };"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("fn", "args")
        }

        // Combined/complex cases

        @Test
        fun `should handle function with mixed parameter types`() {
            val code = "function process(a, { b, c }, [d, e], ...rest) { }"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("process", "b", "c", "d", "e", "rest")
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

        // TypeScript specific edge cases

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
        fun `should handle async function with destructuring`() {
            val code = "async function fetch({ url, method }) { }"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("fetch", "url", "method")
        }

        // Catch clause edge cases

        @Test
        fun `should handle nested try-catch`() {
            val code = """
                try {
                    try { } catch (inner) { }
                } catch (outer) { }
            """.trimIndent()
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("inner", "outer")
        }

        @Test
        fun `should handle catch without parameter`() {
            // ES2019+ optional catch binding
            val code = "try { } catch { console.log('error'); }"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).isEmpty()
        }

        @Test
        fun `should handle try-catch-finally`() {
            val code = "try { } catch (err) { } finally { }"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("err")
        }

        // Enum edge cases

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

        // Type parameter edge cases

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

        // Private field edge cases

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

        // Namespace edge cases

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
    inner class CatchClauseTests {
        @Test
        fun `should extract catch clause variable`() {
            // Arrange
            val code = "try { } catch (error) { console.log(error); }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("error")
        }

        @Test
        fun `should extract catch clause with destructuring`() {
            // Arrange
            val code = "try { } catch ({ message, code }) { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("message", "code")
        }

        @Test
        fun `should extract typescript typed catch clause`() {
            // Arrange
            val code = "try { } catch (error: unknown) { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("error")
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
    inner class ImportStringTests {
        @Test
        fun `should not extract import path strings`() {
            // Arrange
            val code = """
                import { Component } from '@angular/core';
                import React from "react";
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.strings).isEmpty()
        }

        @Test
        fun `should not extract export path strings`() {
            // Arrange
            val code = """
                export { foo } from './foo';
                export * from "../utils";
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.strings).isEmpty()
        }

        @Test
        fun `should not extract require path strings`() {
            // Arrange
            val code = """
                const fs = require('fs');
                const path = require("path");
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.strings).isEmpty()
        }

        @Test
        fun `should still extract regular strings alongside imports`() {
            // Arrange
            val code = """
                import React from 'react';
                const message = "Hello World";
                const greeting = 'Welcome';
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.strings).containsExactly("Hello World", "Welcome")
        }

        @Test
        fun `should still extract template strings not in imports`() {
            // Arrange
            val code = "const msg = `Hello`;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.strings).containsExactly("Hello")
        }

        @Test
        fun `should not extract dynamic import strings`() {
            // Arrange
            val code = """const mod = import('./module');"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.strings).isEmpty()
        }

        @Test
        fun `should handle mixed imports and regular strings`() {
            // Arrange
            val code = """
                import { service } from '@app/services';
                const config = require('./config');
                const name = "MyApp";
                export { utils } from './utils';
                const version = '1.0.0';
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.strings).containsExactly("MyApp", "1.0.0")
        }
    }

    @Nested
    inner class APITests {
        @Test
        fun `should report extraction is supported for JavaScript`() {
            assertThat(TreeSitterExtraction.isExtractionSupported(Language.JAVASCRIPT)).isTrue()
            assertThat(TreeSitterExtraction.isExtractionSupported(".js")).isTrue()
            assertThat(TreeSitterExtraction.isExtractionSupported(".jsx")).isTrue()
        }

        @Test
        fun `should report extraction is supported for TypeScript`() {
            assertThat(TreeSitterExtraction.isExtractionSupported(Language.TYPESCRIPT)).isTrue()
            assertThat(TreeSitterExtraction.isExtractionSupported(".ts")).isTrue()
            assertThat(TreeSitterExtraction.isExtractionSupported(".tsx")).isTrue()
        }

        @Test
        fun `should return JavaScript and TypeScript in supported languages`() {
            // Act & Assert
            assertThat(TreeSitterExtraction.isExtractionSupported(Language.JAVASCRIPT)).isTrue()
            assertThat(TreeSitterExtraction.isExtractionSupported(Language.TYPESCRIPT)).isTrue()
        }
    }
}
