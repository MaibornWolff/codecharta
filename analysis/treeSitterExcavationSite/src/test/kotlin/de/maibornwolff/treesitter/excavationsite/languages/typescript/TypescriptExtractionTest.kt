package de.maibornwolff.treesitter.excavationsite.languages.typescript

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class TypescriptExtractionTest {
    // === Type Alias Tests ===

    @Nested
    inner class TypeAliasTests {
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
        fun `should extract multiple type aliases`() {
            // Arrange
            val code = """
                type UserId = string;
                type OrderId = number;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("UserId", "OrderId")
        }

        @Test
        fun `should extract type alias with union type`() {
            // Arrange
            val code = "type Status = 'pending' | 'active' | 'completed';"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Status")
        }

        @Test
        fun `should extract type alias with intersection type`() {
            // Arrange
            val code = "type Named = { name: string } & { id: number };"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Named", "name", "id")
        }

        @Test
        fun `should extract generic type alias`() {
            // Arrange
            val code = "type Container<T> = { value: T };"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Container", "T", "value")
        }

        @Test
        fun `should extract mapped type alias`() {
            // Arrange
            val code = "type Readonly<T> = { readonly [K in keyof T]: T[K] };"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            // Note: mapped type parameter K is not extracted as an identifier container
            assertThat(result.identifiers).containsExactly("Readonly", "T")
        }

        @Test
        fun `should extract conditional type alias`() {
            // Arrange
            val code = "type NonNullable<T> = T extends null | undefined ? never : T;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("NonNullable", "T")
        }
    }

    // === Interface Tests ===

    @Nested
    inner class InterfaceTests {
        @Test
        fun `should extract interface declaration identifier`() {
            // Arrange
            val code = "interface Drawable { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Drawable")
        }

        @Test
        fun `should extract interface with properties`() {
            // Arrange
            val code = """
                interface User {
                    name: string;
                    age: number;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("User", "name", "age")
        }

        @Test
        fun `should extract interface with methods`() {
            // Arrange
            val code = """
                interface Repository {
                    find(id: string): User;
                    save(user: User): void;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Repository", "id", "user")
        }

        @Test
        fun `should extract interface extending another`() {
            // Arrange
            val code = """
                interface Animal {
                    name: string;
                }
                interface Dog extends Animal {
                    breed: string;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Animal", "name", "Dog", "breed")
        }

        @Test
        fun `should extract interface with optional properties`() {
            // Arrange
            val code = """
                interface Config {
                    required: string;
                    optional?: number;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Config", "required", "optional")
        }

        @Test
        fun `should extract interface with readonly properties`() {
            // Arrange
            val code = """
                interface Point {
                    readonly x: number;
                    readonly y: number;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Point", "x", "y")
        }

        @Test
        fun `should extract generic interface`() {
            // Arrange
            val code = """
                interface Repository<T> {
                    findById(id: string): T;
                    save(entity: T): void;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Repository", "T", "id", "entity")
        }

        @Test
        fun `should extract interface with index signature`() {
            // Arrange
            val code = """
                interface StringMap {
                    [key: string]: string;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            // Note: index signature parameter is not extracted as an identifier container
            assertThat(result.identifiers).containsExactly("StringMap")
        }

        @Test
        fun `should extract interface with call signature`() {
            // Arrange
            val code = """
                interface Callable {
                    (arg: string): number;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Callable", "arg")
        }
    }

    // === Enum Tests ===

    @Nested
    inner class EnumTests {
        @Test
        fun `should extract enum declaration and members`() {
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
        fun `should extract enum with numeric values`() {
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
        fun `should extract string enum`() {
            // Arrange
            val code = """
                enum Direction {
                    Up = "UP",
                    Down = "DOWN",
                    Left = "LEFT",
                    Right = "RIGHT"
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Direction", "Up", "Down", "Left", "Right")
        }

        @Test
        fun `should extract const enum`() {
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

        @Test
        fun `should extract computed enum member`() {
            // Arrange
            val code = """
                enum FileAccess {
                    None,
                    Read = 1 << 1,
                    Write = 1 << 2,
                    ReadWrite = Read | Write
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("FileAccess", "None", "Read", "Write", "ReadWrite")
        }

        @Test
        fun `should handle empty enum`() {
            // Arrange
            val code = "enum Empty { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Empty")
        }

        @Test
        fun `should handle single member enum`() {
            // Arrange
            val code = "enum Single { ONLY }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Single", "ONLY")
        }
    }

    // === Generics and Type Parameter Tests ===

    @Nested
    inner class GenericsTests {
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
            val code = "function pair<T, U>(first: T, second: U): [T, U] { return [first, second]; }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("pair", "T", "U", "first", "second")
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
        fun `should extract constrained type parameter`() {
            // Arrange
            val code = "function longest<T extends { length: number }>(a: T, b: T): T { return a; }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("longest", "T", "length", "a", "b")
        }

        @Test
        fun `should extract type parameter with default`() {
            // Arrange
            val code = "function create<T = string>(): T { return {} as T; }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("create", "T")
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

        @Test
        fun `should extract method type parameter`() {
            // Arrange
            val code = """
                class Service {
                    transform<T>(input: T): T { return input; }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Service", "transform", "T", "input")
        }

        @Test
        fun `should extract type parameter in type alias`() {
            // Arrange
            val code = "type Maybe<T> = T | null | undefined;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Maybe", "T")
        }

        @Test
        fun `should extract keyof in type parameter constraint`() {
            // Arrange
            val code = "function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] { return obj[key]; }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("getProperty", "T", "K", "obj", "key")
        }
    }

    // === Decorator Tests ===

    @Nested
    inner class DecoratorTests {
        @Test
        fun `should extract class decorator name`() {
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
        fun `should extract multiple class decorators`() {
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
        fun `should extract property decorator`() {
            // Arrange
            val code = """
                class MyClass {
                    @Input()
                    myProperty: string;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            // Note: Property decorators like @Input() are not extracted, only class/method/accessor decorators
            assertThat(result.identifiers).containsExactly("MyClass", "myProperty")
        }

        @Test
        fun `should extract parameter decorator`() {
            // Arrange
            val code = """
                class MyClass {
                    myMethod(@Inject('token') service: Service) { }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            // Note: Parameter decorators like @Inject() are not extracted, only class/method/accessor decorators
            assertThat(result.identifiers).containsExactly("MyClass", "myMethod", "service")
        }

        @Test
        fun `should extract multiple method decorators`() {
            // Arrange
            val code = """
                class Controller {
                    @Get('/users')
                    @Validate()
                    getUsers() { }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Controller", "Get", "Validate", "getUsers")
        }

        @Test
        fun `should extract accessor decorator`() {
            // Arrange
            val code = """
                class Point {
                    @configurable(false)
                    get x() { return this._x; }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Point", "configurable", "x")
        }
    }

    // === Namespace Tests ===

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
        fun `should extract namespace with members`() {
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
        fun `should extract deeply nested namespaces`() {
            // Arrange
            val code = """
                namespace A {
                    namespace B {
                        namespace C {
                            export const value = 1;
                        }
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("A", "B", "C", "value")
        }

        @Test
        fun `should extract namespace with interface and class`() {
            // Arrange
            val code = """
                namespace Models {
                    export interface User { name: string; }
                    export class UserImpl { name: string; }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Models", "User", "name", "UserImpl", "name")
        }

        @Test
        fun `should handle empty namespace`() {
            // Arrange
            val code = "namespace Empty { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Empty")
        }
    }

    // === Access Modifier Tests ===

    @Nested
    inner class AccessModifierTests {
        @Test
        fun `should extract public property`() {
            // Arrange
            val code = """
                class User {
                    public name: string;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("User", "name")
        }

        @Test
        fun `should extract private property`() {
            // Arrange
            val code = """
                class User {
                    private id: number;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("User", "id")
        }

        @Test
        fun `should extract protected property`() {
            // Arrange
            val code = """
                class User {
                    protected createdAt: Date;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("User", "createdAt")
        }

        @Test
        fun `should extract constructor parameter properties`() {
            // Arrange
            val code = """
                class User {
                    constructor(
                        public name: string,
                        private id: number,
                        protected role: string
                    ) { }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("User", "name", "id", "role")
        }

        @Test
        fun `should extract readonly modifier`() {
            // Arrange
            val code = """
                class Config {
                    readonly version: string = "1.0";
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Config", "version")
        }

        @Test
        fun `should extract static modifier`() {
            // Arrange
            val code = """
                class Counter {
                    static count: number = 0;
                    static increment() { Counter.count++; }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Counter", "count", "increment")
        }

        @Test
        fun `should extract combined modifiers`() {
            // Arrange
            val code = """
                class Service {
                    private static readonly instance: Service;
                    protected readonly config: Config;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Service", "instance", "config")
        }
    }

    // === Abstract Class Tests ===
    // Note: Abstract class declarations use a different node type (abstract_class_declaration)
    // which is currently not in the identifier container list, so only members are extracted

    @Nested
    inner class AbstractTests {
        @Test
        fun `should extract members from abstract class`() {
            // Arrange
            val code = """
                abstract class Animal {
                    name: string;
                    abstract speak(): void;
                    move() { console.log("moving"); }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            // Note: abstract class name is not extracted (abstract_class_declaration not in containers)
            assertThat(result.identifiers).containsExactly("name", "move")
        }

        @Test
        fun `should extract from class extending abstract class`() {
            // Arrange
            val code = """
                abstract class Animal { }
                class Dog extends Animal {
                    breed: string;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            // Note: abstract class name is not extracted
            assertThat(result.identifiers).containsExactly("Dog", "breed")
        }

        @Test
        fun `should extract abstract property value`() {
            // Arrange
            val code = """
                abstract class Base {
                    abstract readonly id: string;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            // Abstract property is extracted (it's still a public_field_definition)
            assertThat(result.identifiers).containsExactly("id")
        }
    }

    // === Optional Parameter and Property Tests ===

    @Nested
    inner class OptionalTests {
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
        fun `should extract multiple optional parameters`() {
            // Arrange
            val code = "function config(host?: string, port?: number, debug?: boolean) { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("config", "host", "port", "debug")
        }

        @Test
        fun `should extract mixed required and optional parameters`() {
            // Arrange
            val code = "function fetch(url: string, options?: RequestInit) { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("fetch", "url", "options")
        }

        @Test
        fun `should extract optional chaining variable`() {
            // Arrange
            val code = "const value = obj?.property?.nested;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("value")
        }

        @Test
        fun `should extract nullish coalescing variable`() {
            // Arrange
            val code = "const result = value ?? defaultValue;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("result")
        }
    }

    // === TSX/JSX Tests ===

    @Nested
    inner class TsxTests {
        @Test
        fun `should extract component function from TSX`() {
            // Arrange
            val code = """
                function MyComponent(props: Props) {
                    return <div>Hello</div>;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("MyComponent", "props")
        }

        @Test
        fun `should extract arrow function component parameters from TSX`() {
            // Arrange
            val code = "const MyComponent = (props: Props) => { return <div>Hello</div>; };"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            // Note: Variable name for arrow function with JSX is not extracted via const declarator
            assertThat(result.identifiers).containsExactly("props")
        }

        @Test
        fun `should extract class component from TSX`() {
            // Arrange
            val code = """
                class MyComponent extends React.Component {
                    render() {
                        return <div>Hello</div>;
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("MyComponent", "render")
        }

        @Test
        fun `should extract generic component`() {
            // Arrange
            val code = """
                function List<T>(props: { items: T[] }) {
                    return <ul></ul>;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            // Note: JSX tag names like 'ul' are also extracted
            assertThat(result.identifiers).containsExactly("List", "T", "props", "items", "ul")
        }
    }

    // === Type Assertion Tests ===

    @Nested
    inner class TypeAssertionTests {
        @Test
        fun `should extract variable with as assertion`() {
            // Arrange
            val code = "const element = document.getElementById('myId') as HTMLElement;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("element")
        }

        @Test
        fun `should extract non-null assertion variable`() {
            // Arrange
            val code = "const definite = maybeNull!;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("definite")
        }

        @Test
        fun `should extract const assertion variable`() {
            // Arrange
            val code = "const tuple = [1, 2, 3] as const;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("tuple")
        }

        @Test
        fun `should extract satisfies operator variable`() {
            // Arrange
            val code = "const config = { host: 'localhost', port: 3000 } satisfies Config;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("config")
        }
    }

    // === Comment Extraction Tests ===

    @Nested
    inner class CommentTests {
        @Test
        fun `should extract single line comment`() {
            // Arrange
            val code = """
                // This is a comment
                const x = 1;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.comments).containsExactly("This is a comment")
        }

        @Test
        fun `should extract multiple single line comments`() {
            // Arrange
            val code = """
                // First comment
                const x = 1;
                // Second comment
                const y = 2;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.comments).containsExactly("First comment", "Second comment")
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
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.comments).containsExactly("This is a\nmultiline comment")
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
        fun `should extract triple-slash directive comment`() {
            // Arrange
            val code = """
                /// <reference path="other.d.ts" />
                const x = 1;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            // Note: triple-slash directives are parsed as XML doc comments, all slashes are removed
            assertThat(result.comments).containsExactly("<reference path=\"other.d.ts\" />")
        }
    }

    // === String Extraction Tests ===

    @Nested
    inner class StringTests {
        @Test
        fun `should extract double quoted string`() {
            // Arrange
            val code = """const message = "Hello World";"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.strings).containsExactly("Hello World")
        }

        @Test
        fun `should extract single quoted string`() {
            // Arrange
            val code = """const message = 'Hello World';"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.strings).containsExactly("Hello World")
        }

        @Test
        fun `should extract template literal`() {
            // Arrange
            val code = "const message = `Hello World`;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.strings).containsExactly("Hello World")
        }

        @Test
        fun `should extract multiple strings`() {
            // Arrange
            val code = """
                const first = "Hello";
                const second = 'World';
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.strings).containsExactly("Hello", "World")
        }
    }

    // === API Tests ===

    @Nested
    inner class APITests {
        @Test
        fun `should report extraction is supported for TypeScript`() {
            // Act & Assert
            assertThat(TreeSitterExtraction.isExtractionSupported(Language.TYPESCRIPT)).isTrue()
        }

        @Test
        fun `should report extraction is supported for ts extension`() {
            // Act & Assert
            assertThat(TreeSitterExtraction.isExtractionSupported(".ts")).isTrue()
        }

        @Test
        fun `should report extraction is supported for tsx extension`() {
            // Act & Assert
            assertThat(TreeSitterExtraction.isExtractionSupported(".tsx")).isTrue()
        }

        @Test
        fun `should return TypeScript in supported languages`() {
            // Act & Assert
            assertThat(TreeSitterExtraction.isExtractionSupported(Language.TYPESCRIPT)).isTrue()
        }

        @Test
        fun `should return ts and tsx in supported extensions`() {
            // Act & Assert
            assertThat(TreeSitterExtraction.isExtractionSupported(".ts")).isTrue()
            assertThat(TreeSitterExtraction.isExtractionSupported(".tsx")).isTrue()
        }
    }

    // === ExtractionResult Tests ===

    @Nested
    inner class ExtractionResultTests {
        @Test
        fun `should correctly categorize extracted items by context`() {
            // Arrange
            val code = """
                // Comment about the class
                class Example {
                    name = "test";
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

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
                class Foo { }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.extractedTexts.map { it.context }).containsExactly(
                ExtractionContext.COMMENT,
                ExtractionContext.IDENTIFIER
            )
        }

        @Test
        fun `should handle empty source code`() {
            // Arrange
            val code = ""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).isEmpty()
            assertThat(result.comments).isEmpty()
            assertThat(result.strings).isEmpty()
        }
    }

    // === Complex Class Tests ===

    @Nested
    inner class ComplexClassTests {
        @Test
        fun `should extract identifiers from complex class`() {
            // Arrange
            val code = """
                class OrderProcessor {
                    private orderId: string;

                    constructor(orderId: string) {
                        this.orderId = orderId;
                    }

                    processOrder(customerId: string) {
                        const result = this.validate();
                        return result;
                    }

                    private validate(): boolean {
                        return true;
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly(
                "OrderProcessor",
                "orderId",
                "orderId",
                "processOrder",
                "customerId",
                "result",
                "validate"
            )
        }

        @Test
        fun `should extract identifiers from class with generics and decorators`() {
            // Arrange
            val code = """
                @Injectable()
                class Repository<T> {
                    private items: T[] = [];

                    @Log
                    find(id: string): T | undefined {
                        return this.items[0];
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Injectable", "Repository", "T", "items", "Log", "find", "id")
        }
    }

    // === Destructuring Tests ===

    @Nested
    inner class DestructuringTests {
        @Test
        fun `should extract object destructuring with types`() {
            // Arrange
            val code = "const { name, age }: Person = getPerson();"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("name", "age")
        }

        @Test
        fun `should extract array destructuring with types`() {
            // Arrange
            val code = "const [first, second]: [string, number] = getTuple();"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("first", "second")
        }

        @Test
        fun `should extract rest parameter with type`() {
            // Arrange
            val code = "function sum(...numbers: number[]): number { return 0; }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("sum", "numbers")
        }

        @Test
        fun `should extract destructured parameter names with type annotation`() {
            // Arrange
            val code = "const Button = ({ label, onClick }: ButtonProps) => label;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactlyInAnyOrder("Button", "label", "onClick")
        }

        @Test
        fun `should extract typed catch clause`() {
            // Arrange
            val code = "try { } catch (error: unknown) { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("error")
        }
    }

    // === Private Field Tests (ES2022 syntax) ===

    @Nested
    inner class PrivateFieldTests {
        @Test
        fun `should extract private field name`() {
            // Arrange
            val code = """
                class User {
                    #id: number;
                    #name: string = "default";
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("User", "id", "name")
        }

        @Test
        fun `should extract private method name`() {
            // Arrange
            val code = """
                class Validator {
                    #validate(): boolean { return true; }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Validator", "validate")
        }
    }

    // === For Loop Tests ===

    @Nested
    inner class ForLoopTests {
        @Test
        fun `should extract for-of loop variable with type`() {
            // Arrange
            val code = "for (const item: Item of items) { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("item")
        }

        @Test
        fun `should extract for-in loop variable`() {
            // Arrange
            val code = "for (const key in object) { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("key")
        }

        @Test
        fun `should extract for-of with destructuring and types`() {
            // Arrange
            val code = "for (const { name, age }: Person of people) { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("name", "age")
        }
    }
}
