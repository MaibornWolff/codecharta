package de.maibornwolff.treesitter.excavationsite.languages.typescript

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.Arguments.argumentSet
import org.junit.jupiter.params.provider.MethodSource

class TypescriptUsedTypeDependencyTest {
    @ParameterizedTest
    @MethodSource("classMemberAndHeritageCases", "typeExpressionCases", "importedNameCases")
    fun `should extract used types of declaration`(code: String, declarationName: String, expectedUsedTypes: List<String>) {
        // Act
        val result = analyzeTypescript(code)

        // Assert
        assertThat(result.usedTypeNamesOf(declarationName)).containsExactlyInAnyOrderElementsOf(expectedUsedTypes)
    }

    @ParameterizedTest
    @MethodSource("lowercaseReferenceCases")
    fun `should not extract lowercase reference as used type`(code: String, lowercaseReference: String) {
        // Act
        val result = analyzeTypescript(code)

        // Assert
        assertThat(result.usedTypeNamesOf("Foo")).doesNotContain(lowercaseReference)
    }

    companion object {
        @JvmStatic
        fun classMemberAndHeritageCases(): List<Arguments> = listOf(
            argumentSet("type annotation", "export class Foo { field: MyService }", "Foo", listOf("MyService")),
            argumentSet("constructor call", "export class Foo { bar() { return new MyService() } }", "Foo", listOf("MyService")),
            argumentSet(
                "uppercase object of member access",
                "export class Foo { bar() { return MyModule.value } }",
                "Foo",
                listOf("MyModule")
            ),
            argumentSet("uppercase identifier", "export class Foo { bar() { return MyFactory } }", "Foo", listOf("MyFactory")),
            argumentSet("generic type argument", "export class Foo { items: Array<MyItem> }", "Foo", listOf("MyItem", "Array")),
            argumentSet("extends clause of interface", "export interface Foo extends Bar {}", "Foo", listOf("Bar")),
            argumentSet("extends clause of class", "export class Foo extends Bar {}", "Foo", listOf("Bar")),
            argumentSet("implements clause", "export class Foo implements IBar, IBaz {}", "Foo", listOf("IBar", "IBaz")),
            argumentSet("constraint of generic type parameter", "export class Foo<T extends Bar> {}", "Foo", listOf("Bar")),
            argumentSet(
                "function parameters and return type",
                "export function process(service: MyService): MyResult {}",
                "process",
                listOf("MyService", "MyResult")
            ),
            argumentSet(
                "decorator identifiers on decorated exported class",
                """
                    import { Component } from '@angular/core'
                    import { MyService } from './my-service'
                    @Component({ imports: [MyService] })
                    export class MyClass {}
                """.trimIndent(),
                "MyClass",
                listOf("Component", "MyService")
            )
        )

        @JvmStatic
        fun typeExpressionCases(): List<Arguments> = listOf(
            argumentSet(
                "type alias right-hand side",
                "export type Foo = ErrorCapturingInterface<Transaction>",
                "Foo",
                listOf("ErrorCapturingInterface", "Transaction")
            ),
            argumentSet("union type alias", "export type Foo = Bar | Baz", "Foo", listOf("Bar", "Baz")),
            argumentSet(
                "type argument of generic function call",
                """
                    import { UserService } from './user'
                    export class Controller {
                        init() { return createService<UserService>() }
                    }
                """.trimIndent(),
                "Controller",
                listOf("UserService")
            ),
            argumentSet(
                "type argument of generic constructor call",
                """
                    import { Item } from './item'
                    export class Store {
                        items = new Map<string, Item>()
                    }
                """.trimIndent(),
                "Store",
                listOf("Map", "Item")
            ),
            argumentSet(
                "type in as-expression",
                """
                    import { Response } from './types'
                    export class Handler {
                        handle(x: unknown) { return x as Response }
                    }
                """.trimIndent(),
                "Handler",
                listOf("Response")
            ),
            argumentSet(
                "type in satisfies-expression",
                """
                    import { Config } from './config'
                    export const settings = { debug: true } satisfies Config
                """.trimIndent(),
                "settings",
                listOf("Config")
            )
        )

        @JvmStatic
        fun importedNameCases(): List<Arguments> = listOf(
            argumentSet(
                "import alias resolved to original type name",
                """
                    import { MyType as MyRenamedType } from './MyType'
                    export class Foo { field: MyRenamedType }
                """.trimIndent(),
                "Foo",
                listOf("MyType")
            ),
            argumentSet(
                "local alias name of default import",
                """
                    import Dep from './dep'
                    export class Foo extends Dep {}
                """.trimIndent(),
                "Foo",
                listOf("Dep")
            ),
            argumentSet(
                "lowercase named import used as function call",
                """
                    import { createHash } from 'crypto'
                    export function process() { return createHash('sha256') }
                """.trimIndent(),
                "process",
                listOf("createHash")
            ),
            argumentSet(
                "aliased lowercase import resolved to original name",
                """
                    import { Hash as createHash } from 'crypto'
                    export function process() { return createHash('sha256') }
                """.trimIndent(),
                "process",
                listOf("Hash")
            ),
            argumentSet(
                "lowercase namespace alias usage",
                """
                    import * as ns from './utils'
                    export class Bar {
                        doWork() { ns.method() }
                    }
                """.trimIndent(),
                "Bar",
                listOf("ns")
            ),
            argumentSet(
                "class name from namespace alias constructor call",
                """
                    import * as types from './types'
                    export class Consumer {
                        log(): void { new types.Logger() }
                    }
                """.trimIndent(),
                "Consumer",
                listOf("types", "Logger")
            ),
            argumentSet(
                "class name from namespace alias member access",
                """
                    import * as types from './types'
                    export class Consumer {
                        create() { return types.Animal.create() }
                    }
                """.trimIndent(),
                "Consumer",
                listOf("types", "Animal")
            )
        )

        @JvmStatic
        fun lowercaseReferenceCases(): List<Arguments> = listOf(
            argumentSet("lowercase object of member access", "export class Foo { bar() { return myModule.value } }", "myModule"),
            argumentSet("lowercase identifier", "export class Foo { bar() { return myFactory } }", "myFactory"),
            argumentSet("lowercase constructor call", "export class Foo { x = new xmlParser() }", "xmlParser")
        )
    }
}
