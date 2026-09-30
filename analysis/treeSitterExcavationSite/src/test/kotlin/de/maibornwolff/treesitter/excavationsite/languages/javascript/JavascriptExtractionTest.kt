package de.maibornwolff.treesitter.excavationsite.languages.javascript

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments.argumentSet
import org.junit.jupiter.params.provider.MethodSource

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class JavascriptExtractionTest {
    @ParameterizedTest
    @MethodSource("declarationCases")
    fun `should extract declaration identifiers`(language: Language, code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, language)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun declarationCases() = listOf(
        argumentSet("extract JavaScript class declaration identifier", Language.JAVASCRIPT, "class UserProfile {}", listOf("UserProfile")),
        argumentSet("extract function declaration identifier", Language.JAVASCRIPT, "function processOrder() {}", listOf("processOrder")),
        argumentSet(
            "extract variable declarator identifiers",
            Language.JAVASCRIPT,
            """
                const userName = "John";
                let userAge = 30;
                var isActive = true;
            """.trimIndent(),
            listOf("userName", "userAge", "isActive")
        ),
        argumentSet(
            "extract method definition identifier",
            Language.JAVASCRIPT,
            """
                class Calculator {
                    add(a, b) {
                        return a + b;
                    }
                }
            """.trimIndent(),
            listOf("Calculator", "add")
        ),
        argumentSet("extract arrow function assigned to variable", Language.JAVASCRIPT, "const double = (x) => x * 2;", listOf("double")),
        argumentSet(
            "extract generator function identifier",
            Language.JAVASCRIPT,
            "function* idGenerator() { yield 1; }",
            listOf("idGenerator")
        ),
        argumentSet(
            "extract identifiers from complex class",
            Language.JAVASCRIPT,
            """
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
            """.trimIndent(),
            listOf("OrderProcessor", "processOrder", "result", "validate")
        ),
        argumentSet("extract TypeScript class declaration identifier", Language.TYPESCRIPT, "class UserProfile {}", listOf("UserProfile")),
        argumentSet(
            "extract interface declaration identifier",
            Language.TYPESCRIPT,
            "interface Drawable { draw(): void; }",
            listOf("Drawable")
        ),
        argumentSet("extract type alias identifier", Language.TYPESCRIPT, "type UserId = string;", listOf("UserId")),
        argumentSet(
            "extract enum declaration identifier",
            Language.TYPESCRIPT,
            """
                enum Status {
                    PENDING,
                    ACTIVE,
                    COMPLETED
                }
            """.trimIndent(),
            listOf("Status", "PENDING", "ACTIVE", "COMPLETED")
        ),
        argumentSet(
            "extract function with typed parameters",
            Language.TYPESCRIPT,
            """
                function calculateTotal(price: number, quantity: number): number {
                    return price * quantity;
                }
            """.trimIndent(),
            listOf("calculateTotal", "price", "quantity")
        ),
        argumentSet(
            "extract class with typed properties",
            Language.TYPESCRIPT,
            """
                class User {
                    name: string;
                    age: number;

                    constructor(name: string, age: number) {
                        this.name = name;
                        this.age = age;
                    }
                }
            """.trimIndent(),
            listOf("User", "name", "age", "name", "age")
        ),
        argumentSet("extract optional parameter", Language.TYPESCRIPT, "function greet(name?: string) { }", listOf("greet", "name"))
    )

    @ParameterizedTest
    @MethodSource("destructuringCases")
    fun `should extract destructured identifiers`(language: Language, code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, language)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun destructuringCases() = listOf(
        argumentSet(
            "extract object destructuring identifiers",
            Language.JAVASCRIPT,
            "const { name, age } = person;",
            listOf("name", "age")
        ),
        argumentSet(
            "extract array destructuring identifiers",
            Language.JAVASCRIPT,
            "const [first, second] = array;",
            listOf("first", "second")
        ),
        argumentSet(
            "extract nested object destructuring",
            Language.JAVASCRIPT,
            "const { user: { name, email } } = response;",
            listOf("name", "email")
        ),
        argumentSet(
            "extract mixed destructuring",
            Language.JAVASCRIPT,
            "const { items: [first, second] } = data;",
            listOf("first", "second")
        ),
        argumentSet(
            "extract destructuring with default values",
            Language.JAVASCRIPT,
            "const { name = 'default', age = 0 } = config;",
            listOf("name", "age")
        ),
        argumentSet(
            "extract destructuring with renaming",
            Language.JAVASCRIPT,
            "const { name: userName, age: userAge } = person;",
            listOf("userName", "userAge")
        ),
        argumentSet(
            "extract function parameter destructuring",
            Language.JAVASCRIPT,
            "function process({ id, data }) { }",
            listOf("process", "id", "data")
        ),
        argumentSet(
            "extract arrow function parameter destructuring",
            Language.JAVASCRIPT,
            "const handler = ({ event, target }) => { };",
            listOf("handler", "event", "target")
        ),
        argumentSet("handle empty object destructuring", Language.JAVASCRIPT, "const {} = obj;", emptyList<String>()),
        argumentSet("handle empty array destructuring", Language.JAVASCRIPT, "const [] = arr;", emptyList<String>()),
        argumentSet("handle deeply nested destructuring", Language.JAVASCRIPT, "const { a: { b: { c: { d } } } } = obj;", listOf("d")),
        argumentSet(
            "handle destructuring with skipped elements",
            Language.JAVASCRIPT,
            "const [, second, , fourth] = arr;",
            listOf("second", "fourth")
        ),
        argumentSet(
            "handle rest with preceding destructured elements",
            Language.JAVASCRIPT,
            "const { a, b, ...rest } = obj;",
            listOf("a", "b", "rest")
        ),
        argumentSet(
            "extract typescript destructuring with types",
            Language.TYPESCRIPT,
            "const { name, age }: Person = getPerson();",
            listOf("name", "age")
        ),
        argumentSet(
            "handle arrow function with destructuring parameter",
            Language.JAVASCRIPT,
            "const fn = ({ a, b }) => a + b;",
            listOf("fn", "a", "b")
        ),
        argumentSet(
            "handle optional chaining in destructuring default",
            Language.TYPESCRIPT,
            "const { value = obj?.default } = config;",
            listOf("value")
        ),
        argumentSet(
            "handle async function with destructuring",
            Language.JAVASCRIPT,
            "async function fetch({ url, method }) { }",
            listOf("fetch", "url", "method")
        )
    )

    @ParameterizedTest
    @MethodSource("forLoopCases")
    fun `should extract for loop variables`(language: Language, code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, language)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun forLoopCases() = listOf(
        argumentSet("extract for-of loop variable", Language.JAVASCRIPT, "for (const item of items) { }", listOf("item")),
        argumentSet("extract for-in loop variable", Language.JAVASCRIPT, "for (const key in object) { }", listOf("key")),
        argumentSet(
            "extract for-of with destructuring",
            Language.JAVASCRIPT,
            "for (const { name, age } of people) { }",
            listOf("name", "age")
        ),
        argumentSet(
            "extract for-of with array destructuring",
            Language.JAVASCRIPT,
            "for (const [key, value] of entries) { }",
            listOf("key", "value")
        ),
        argumentSet("extract for-of with let", Language.JAVASCRIPT, "for (let item of items) { }", listOf("item")),
        argumentSet("extract for-of with var", Language.JAVASCRIPT, "for (var item of items) { }", listOf("item")),
        argumentSet(
            "handle nested for-of loops",
            Language.JAVASCRIPT,
            """
                for (const outer of outerList) {
                    for (const inner of innerList) { }
                }
            """.trimIndent(),
            listOf("outer", "inner")
        )
    )

    @ParameterizedTest
    @MethodSource("restPatternCases")
    fun `should extract rest parameters and elements`(language: Language, code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, language)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun restPatternCases() = listOf(
        argumentSet("extract rest parameter in function", Language.JAVASCRIPT, "function sum(...numbers) { }", listOf("sum", "numbers")),
        argumentSet(
            "extract rest element in array destructuring",
            Language.JAVASCRIPT,
            "const [first, ...rest] = array;",
            listOf("first", "rest")
        ),
        argumentSet(
            "extract rest element in object destructuring",
            Language.JAVASCRIPT,
            "const { id, ...remaining } = obj;",
            listOf("id", "remaining")
        ),
        argumentSet(
            "extract typescript rest parameter with type",
            Language.TYPESCRIPT,
            "function sum(...numbers: number[]): number { return 0; }",
            listOf("sum", "numbers")
        ),
        argumentSet(
            "handle arrow function with rest parameter - expression body",
            Language.JAVASCRIPT,
            "const fn = (...args) => args;",
            listOf("fn", "args")
        ),
        argumentSet(
            "handle arrow function with rest parameter - block body",
            Language.JAVASCRIPT,
            "const fn = (...args) => { return args; };",
            listOf("fn", "args")
        ),
        argumentSet(
            "handle function with mixed parameter types",
            Language.JAVASCRIPT,
            "function process(a, { b, c }, [d, e], ...rest) { }",
            listOf("process", "b", "c", "d", "e", "rest")
        )
    )

    @ParameterizedTest
    @MethodSource("decoratorCases")
    fun `should extract decorator names`(language: Language, code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, language)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun decoratorCases() = listOf(
        argumentSet(
            "extract decorator name",
            Language.TYPESCRIPT,
            """
                @Component
                class MyComponent { }
            """.trimIndent(),
            listOf("Component", "MyComponent")
        ),
        argumentSet(
            "extract decorator with call expression",
            Language.TYPESCRIPT,
            """
                @Component({ selector: 'app-root' })
                class AppComponent { }
            """.trimIndent(),
            listOf("Component", "AppComponent")
        ),
        argumentSet(
            "extract multiple decorators",
            Language.TYPESCRIPT,
            """
                @Injectable()
                @Serializable
                class MyService { }
            """.trimIndent(),
            listOf("Injectable", "Serializable", "MyService")
        ),
        argumentSet(
            "extract method decorator",
            Language.TYPESCRIPT,
            """
                class MyClass {
                    @Log
                    myMethod() { }
                }
            """.trimIndent(),
            listOf("MyClass", "Log", "myMethod")
        ),
        argumentSet(
            "handle decorator with member expression without its object",
            Language.TYPESCRIPT,
            """
                @Ng.Component()
                class MyComponent { }
            """.trimIndent(),
            listOf("MyComponent")
        ),
        argumentSet(
            "not extract property decorator",
            Language.TYPESCRIPT,
            """
                class MyClass {
                    @Input()
                    myProperty: string;
                }
            """.trimIndent(),
            listOf("MyClass", "myProperty")
        ),
        argumentSet(
            "handle class with multiple decorated methods",
            Language.TYPESCRIPT,
            """
                class Controller {
                    @Get('/users')
                    getUsers() { }

                    @Post('/users')
                    @Validate()
                    createUser() { }
                }
            """.trimIndent(),
            listOf("Controller", "Get", "getUsers", "Post", "Validate", "createUser")
        )
    )

    @ParameterizedTest
    @MethodSource("classMemberCases")
    fun `should extract getter, setter and static member names`(language: Language, code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, language)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun classMemberCases() = listOf(
        argumentSet(
            "extract getter name",
            Language.JAVASCRIPT,
            """
                class User {
                    get name() { return this._name; }
                }
            """.trimIndent(),
            listOf("User", "name")
        ),
        argumentSet(
            "extract setter name",
            Language.JAVASCRIPT,
            """
                class User {
                    set name(value) { this._name = value; }
                }
            """.trimIndent(),
            listOf("User", "name")
        ),
        argumentSet(
            "extract both getter and setter",
            Language.JAVASCRIPT,
            """
                class User {
                    get name() { return this._name; }
                    set name(value) { this._name = value; }
                }
            """.trimIndent(),
            listOf("User", "name", "name")
        ),
        argumentSet(
            "extract static method name",
            Language.JAVASCRIPT,
            """
                class Math {
                    static sqrt(x) { return x; }
                }
            """.trimIndent(),
            listOf("Math", "sqrt")
        ),
        argumentSet(
            "extract static field name",
            Language.JAVASCRIPT,
            """
                class Math {
                    static PI = 3.14159;
                }
            """.trimIndent(),
            listOf("Math", "PI")
        ),
        argumentSet(
            "extract static and instance members together",
            Language.JAVASCRIPT,
            """
                class Counter {
                    static count = 0;
                    value = 0;

                    static increment() { Counter.count++; }
                    getValue() { return this.value; }
                }
            """.trimIndent(),
            listOf("Counter", "count", "value", "increment", "getValue")
        )
    )

    @ParameterizedTest
    @MethodSource("privateMemberCases")
    fun `should extract private member names`(language: Language, code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, language)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun privateMemberCases() = listOf(
        argumentSet(
            "extract private field name",
            Language.JAVASCRIPT,
            """
                class User {
                    #id;
                    #name = "default";
                }
            """.trimIndent(),
            listOf("User", "id", "name")
        ),
        argumentSet(
            "extract private method name",
            Language.JAVASCRIPT,
            """
                class Validator {
                    #validate() { return true; }
                }
            """.trimIndent(),
            listOf("Validator", "validate")
        ),
        argumentSet(
            "extract mixed private and public members",
            Language.JAVASCRIPT,
            """
                class Account {
                    #balance = 0;
                    name;

                    #updateBalance() { }
                    getBalance() { return this.#balance; }
                }
            """.trimIndent(),
            listOf("Account", "balance", "name", "updateBalance", "getBalance")
        ),
        argumentSet(
            "extract static private field",
            Language.JAVASCRIPT,
            """
                class Counter {
                    static #count = 0;
                    static #increment() { Counter.#count++; }
                }
            """.trimIndent(),
            listOf("Counter", "count", "increment")
        ),
        argumentSet(
            "extract private getter and setter",
            Language.JAVASCRIPT,
            """
                class Box {
                    #value = 0;
                    get #secret() { return this.#value; }
                    set #secret(v) { this.#value = v; }
                }
            """.trimIndent(),
            listOf("Box", "value", "secret", "secret")
        ),
        argumentSet(
            "handle class with only private members",
            Language.JAVASCRIPT,
            """
                class Private {
                    #a;
                    #b;
                    #method() { }
                }
            """.trimIndent(),
            listOf("Private", "a", "b", "method")
        )
    )

    @ParameterizedTest
    @MethodSource("catchClauseCases")
    fun `should extract catch clause variables`(language: Language, code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, language)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun catchClauseCases() = listOf(
        argumentSet("extract catch clause variable", Language.JAVASCRIPT, "try { } catch (error) { console.log(error); }", listOf("error")),
        argumentSet(
            "extract catch clause with destructuring",
            Language.JAVASCRIPT,
            "try { } catch ({ message, code }) { }",
            listOf("message", "code")
        ),
        argumentSet("extract typescript typed catch clause", Language.TYPESCRIPT, "try { } catch (error: unknown) { }", listOf("error")),
        argumentSet(
            "handle nested try-catch",
            Language.JAVASCRIPT,
            """
                try {
                    try { } catch (inner) { }
                } catch (outer) { }
            """.trimIndent(),
            listOf("inner", "outer")
        ),
        argumentSet("handle catch without parameter", Language.JAVASCRIPT, "try { } catch { console.log('error'); }", emptyList<String>()),
        argumentSet("handle try-catch-finally", Language.JAVASCRIPT, "try { } catch (err) { } finally { }", listOf("err"))
    )

    @ParameterizedTest
    @MethodSource("enumMemberCases")
    fun `should extract enum members`(language: Language, code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, language)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun enumMemberCases() = listOf(
        argumentSet(
            "extract enum members without values",
            Language.TYPESCRIPT,
            """
                enum Status {
                    PENDING,
                    ACTIVE,
                    COMPLETED
                }
            """.trimIndent(),
            listOf("Status", "PENDING", "ACTIVE", "COMPLETED")
        ),
        argumentSet(
            "extract enum members with values",
            Language.TYPESCRIPT,
            """
                enum HttpStatus {
                    OK = 200,
                    NOT_FOUND = 404,
                    SERVER_ERROR = 500
                }
            """.trimIndent(),
            listOf("HttpStatus", "OK", "NOT_FOUND", "SERVER_ERROR")
        ),
        argumentSet(
            "extract mixed enum members",
            Language.TYPESCRIPT,
            """
                enum Direction {
                    UP,
                    DOWN = 1,
                    LEFT,
                    RIGHT = 3
                }
            """.trimIndent(),
            listOf("Direction", "UP", "DOWN", "LEFT", "RIGHT")
        ),
        argumentSet(
            "extract const enum members",
            Language.TYPESCRIPT,
            """
                const enum Color {
                    RED,
                    GREEN,
                    BLUE
                }
            """.trimIndent(),
            listOf("Color", "RED", "GREEN", "BLUE")
        ),
        argumentSet(
            "extract string enum members",
            Language.TYPESCRIPT,
            """
                enum Direction {
                    Up = "UP",
                    Down = "DOWN"
                }
            """.trimIndent(),
            listOf("Direction", "Up", "Down")
        ),
        argumentSet("handle enum with single member", Language.TYPESCRIPT, "enum Single { ONLY }", listOf("Single", "ONLY")),
        argumentSet("handle empty enum", Language.TYPESCRIPT, "enum Empty { }", listOf("Empty"))
    )

    @ParameterizedTest
    @MethodSource("typeParameterCases")
    fun `should extract type parameters`(language: Language, code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, language)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun typeParameterCases() = listOf(
        argumentSet(
            "extract function type parameter",
            Language.TYPESCRIPT,
            "function identity<T>(arg: T): T { return arg; }",
            listOf("identity", "T", "arg")
        ),
        argumentSet(
            "extract multiple type parameters",
            Language.TYPESCRIPT,
            "function map<T, U>(arr: T[], fn: (x: T) => U): U[] { return []; }",
            listOf("map", "T", "U", "arr", "fn", "x")
        ),
        argumentSet(
            "extract class type parameter",
            Language.TYPESCRIPT,
            "class Container<T> { value: T; }",
            listOf("Container", "T", "value")
        ),
        argumentSet(
            "extract interface type parameter",
            Language.TYPESCRIPT,
            "interface Repository<T> { find(id: string): T; }",
            listOf("Repository", "T", "id")
        ),
        argumentSet(
            "extract constrained type parameter",
            Language.TYPESCRIPT,
            "function longest<T extends { length: number }>(a: T, b: T): T { return a; }",
            listOf("longest", "T", "length", "a", "b")
        ),
        argumentSet(
            "extract arrow function type parameter",
            Language.TYPESCRIPT,
            "const identity = <T>(x: T): T => x;",
            listOf("identity", "T", "x")
        ),
        argumentSet(
            "handle generic function",
            Language.TYPESCRIPT,
            "function identity<T>(arg: T): T { return arg; }",
            listOf("identity", "T", "arg")
        ),
        argumentSet(
            "extract type parameter with default",
            Language.TYPESCRIPT,
            "function create<T = string>(): T { return {} as T; }",
            listOf("create", "T")
        ),
        argumentSet(
            "extract type parameter with multiple constraints",
            Language.TYPESCRIPT,
            "function merge<T extends object, U extends object>(a: T, b: U): T & U { return {...a, ...b}; }",
            listOf("merge", "T", "U", "a", "b")
        ),
        argumentSet(
            "extract type parameter in type alias",
            Language.TYPESCRIPT,
            "type Container<T> = { value: T };",
            listOf("Container", "T", "value")
        ),
        argumentSet(
            "handle method with type parameter",
            Language.TYPESCRIPT,
            """
                class Service {
                    transform<T>(input: T): T { return input; }
                }
            """.trimIndent(),
            listOf("Service", "transform", "T", "input")
        )
    )

    @ParameterizedTest
    @MethodSource("namespaceCases")
    fun `should extract namespace identifiers`(language: Language, code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, language)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun namespaceCases() = listOf(
        argumentSet("extract namespace declaration identifier", Language.TYPESCRIPT, "namespace Utils { }", listOf("Utils")),
        argumentSet(
            "extract namespace with exported members",
            Language.TYPESCRIPT,
            """
                namespace Math {
                    export const PI = 3.14159;
                    export function sqrt(x: number): number { return x; }
                }
            """.trimIndent(),
            listOf("Math", "PI", "sqrt", "x")
        ),
        argumentSet(
            "extract nested namespace",
            Language.TYPESCRIPT,
            """
                namespace Outer {
                    namespace Inner {
                        export const VALUE = 42;
                    }
                }
            """.trimIndent(),
            listOf("Outer", "Inner", "VALUE")
        ),
        argumentSet(
            "extract module declaration identifier",
            Language.TYPESCRIPT,
            "namespace MyModule { export class MyClass { } }",
            listOf("MyModule", "MyClass")
        ),
        argumentSet(
            "handle deeply nested namespaces",
            Language.TYPESCRIPT,
            """
                namespace A {
                    namespace B {
                        namespace C {
                            export const value = 1;
                        }
                    }
                }
            """.trimIndent(),
            listOf("A", "B", "C", "value")
        ),
        argumentSet(
            "handle namespace with interface and class",
            Language.TYPESCRIPT,
            """
                namespace Models {
                    export interface User { name: string; }
                    export class UserImpl { name: string; }
                }
            """.trimIndent(),
            listOf("Models", "User", "name", "UserImpl", "name")
        ),
        argumentSet("handle empty namespace", Language.TYPESCRIPT, "namespace Empty { }", listOf("Empty"))
    )

    @ParameterizedTest
    @MethodSource("commentCases")
    fun `should extract comment text`(language: Language, code: String, expectedComments: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, language)

        // Assert
        assertThat(result.comments).containsExactlyElementsOf(expectedComments)
    }

    fun commentCases() = listOf(
        argumentSet("extract single line comment", Language.JAVASCRIPT, "// This is a comment\nconst x = 1;", listOf("This is a comment")),
        argumentSet(
            "extract multiline comment",
            Language.JAVASCRIPT,
            """
                /*
                 * This is a
                 * multiline comment
                 */
                const x = 1;
            """.trimIndent(),
            listOf("This is a\nmultiline comment")
        ),
        argumentSet(
            "extract JSDoc comment",
            Language.TYPESCRIPT,
            """
                /**
                 * Calculates the sum of two numbers
                 * @param a First number
                 * @param b Second number
                 */
                function add(a: number, b: number): number {
                    return a + b;
                }
            """.trimIndent(),
            listOf("Calculates the sum of two numbers\n@param a First number\n@param b Second number")
        )
    )

    @ParameterizedTest
    @MethodSource("stringCases")
    fun `should extract string literals`(language: Language, code: String, expectedStrings: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, language)

        // Assert
        assertThat(result.strings).containsExactlyElementsOf(expectedStrings)
    }

    fun stringCases() = listOf(
        argumentSet("extract double quoted string", Language.JAVASCRIPT, """const message = "Hello World";""", listOf("Hello World")),
        argumentSet("extract single quoted string", Language.JAVASCRIPT, """const message = 'Hello World';""", listOf("Hello World")),
        argumentSet("extract template string", Language.JAVASCRIPT, "const message = `Hello World`;", listOf("Hello World"))
    )

    @ParameterizedTest
    @MethodSource("moduleSpecifierCases")
    fun `should skip module specifier strings`(language: Language, code: String, expectedStrings: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, language)

        // Assert
        assertThat(result.strings).containsExactlyElementsOf(expectedStrings)
    }

    fun moduleSpecifierCases() = listOf(
        argumentSet(
            "not extract import path strings",
            Language.JAVASCRIPT,
            """
                import { Component } from '@angular/core';
                import React from "react";
            """.trimIndent(),
            emptyList<String>()
        ),
        argumentSet(
            "not extract export path strings",
            Language.JAVASCRIPT,
            """
                export { foo } from './foo';
                export * from "../utils";
            """.trimIndent(),
            emptyList<String>()
        ),
        argumentSet(
            "not extract require path strings",
            Language.JAVASCRIPT,
            """
                const fs = require('fs');
                const path = require("path");
            """.trimIndent(),
            emptyList<String>()
        ),
        argumentSet(
            "still extract regular strings alongside imports",
            Language.JAVASCRIPT,
            """
                import React from 'react';
                const message = "Hello World";
                const greeting = 'Welcome';
            """.trimIndent(),
            listOf("Hello World", "Welcome")
        ),
        argumentSet("still extract template strings not in imports", Language.JAVASCRIPT, "const msg = `Hello`;", listOf("Hello")),
        argumentSet("not extract dynamic import strings", Language.JAVASCRIPT, """const mod = import('./module');""", emptyList<String>()),
        argumentSet(
            "handle mixed imports and regular strings",
            Language.JAVASCRIPT,
            """
                import { service } from '@app/services';
                const config = require('./config');
                const name = "MyApp";
                export { utils } from './utils';
                const version = '1.0.0';
            """.trimIndent(),
            listOf("MyApp", "1.0.0")
        )
    )

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
