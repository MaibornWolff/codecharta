package de.maibornwolff.treesitter.excavationsite.languages.typescript

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class TypescriptDependencyUsedTypeTest {
    @Nested
    inner class UsedTypeExtraction {
        @Test
        fun `should extract type from type annotation`() {
            // Arrange
            val code = "export class Foo { field: MyService }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("MyService")
        }

        @Test
        fun `should extract type from constructor call`() {
            // Arrange
            val code = "export class Foo { bar() { return new MyService() } }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("MyService")
        }

        @Test
        fun `should extract uppercase object from member access`() {
            // Arrange
            val code = "export class Foo { bar() { return MyModule.value } }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("MyModule")
        }

        @Test
        fun `should report the free lower-case object of a member access as a possible global`() {
            // Arrange
            val code = "export class Foo { bar() { return myModule.value } }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val uses = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name to it.namespacePrefix }
            assertThat(uses).containsExactly("myModule" to listOf("GLOBAL"))
        }

        @Test
        fun `should extract extends clause type from interface declaration`() {
            // Arrange
            val code = "export interface Foo extends Bar {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("Bar")
        }

        @Test
        fun `should extract extends clause type`() {
            // Arrange
            val code = "export class Foo extends Bar {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("Bar")
        }

        @Test
        fun `should extract implements clause types`() {
            // Arrange
            val code = "export class Foo implements IBar, IBaz {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("IBar", "IBaz")
        }

        @Test
        fun `should extract uppercase identifier`() {
            // Arrange
            val code = "export class Foo { bar() { return MyFactory } }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("MyFactory")
        }

        @Test
        fun `should report a free lower-case identifier as a possible global`() {
            // Arrange
            val code = "export class Foo { bar() { return myFactory } }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val uses = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name to it.namespacePrefix }
            assertThat(uses).containsExactly("myFactory" to listOf("GLOBAL"))
        }

        @Test
        fun `should extract generic type argument`() {
            // Arrange
            val code = "export class Foo { items: Array<MyItem> }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("MyItem", "Array")
        }

        @Test
        fun `should resolve import alias to original type name in usedTypes`() {
            // Arrange
            val code = """
                import { MyType as MyRenamedType } from './MyType'
                export class Foo { field: MyRenamedType }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("MyType")
        }

        @Test
        fun `should extract type constraint from generic type parameter`() {
            // Arrange
            val code = "export class Foo<T extends Bar> {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("Bar")
        }

        @Test
        fun `should extract type reference from type alias right-hand side`() {
            // Arrange
            val code = "export type Foo = ErrorCapturingInterface<Transaction>"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("ErrorCapturingInterface", "Transaction")
        }

        @Test
        fun `should extract multiple types from union type alias`() {
            // Arrange
            val code = "export type Foo = Bar | Baz"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("Bar", "Baz")
        }

        @Test
        fun `should emit local alias name in usedTypes for default import`() {
            // Arrange
            val code = """
                import Dep from './dep'
                export class Foo extends Dep {}
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("Dep")
        }
    }

    @Nested
    inner class NamedImportValueUsages {
        @Test
        fun `should emit lowercase named import used as function call as usedType`() {
            // Arrange
            val code = """
                import { createHash } from 'crypto'
                export function process() { return createHash('sha256') }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "process" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("createHash")
        }

        @Test
        fun `should resolve aliased lowercase import to original name as usedType`() {
            // Arrange
            val code = """
                import { Hash as createHash } from 'crypto'
                export function process() { return createHash('sha256') }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "process" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("Hash")
        }
    }

    @Nested
    inner class DecoratorUsedTypes {
        @Test
        fun `should emit decorator identifiers as usedTypes on decorated exported class`() {
            // Arrange
            val code = """
                import { Component } from '@angular/core'
                import { MyService } from './my-service'
                @Component({ imports: [MyService] })
                export class MyClass {}
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "MyClass" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("Component", "MyService")
        }
    }

    @Nested
    inner class GenericTypeArguments {
        @Test
        fun `should emit type argument of generic function call as usedType`() {
            // Arrange
            val code = """
                import { UserService } from './user'
                export class Controller {
                    init() { return createService<UserService>() }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Controller" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("createService", "UserService")
        }

        @Test
        fun `should emit type argument of generic constructor call as usedType`() {
            // Arrange
            val code = """
                import { Item } from './item'
                export class Store {
                    items = new Map<string, Item>()
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Store" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("Map", "Item")
        }
    }

    @Nested
    inner class TypeAssertionAndSatisfies {
        @Test
        fun `should emit type in as-expression as usedType`() {
            // Arrange
            val code = """
                import { Response } from './types'
                export class Handler {
                    handle(x: unknown) { return x as Response }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Handler" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("Response")
        }

        @Test
        fun `should emit type in satisfies-expression as usedType`() {
            // Arrange
            val code = """
                import { Config } from './config'
                export const settings = { debug: true } satisfies Config
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "settings" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("Config")
        }
    }

    @Nested
    inner class NamespaceImportUsedTypeExtraction {
        @Test
        fun `should recognize lowercase namespace alias usages and the member they read as usedTypes`() {
            // Arrange
            val code = """
                import * as ns from './utils'
                export class Bar {
                    doWork() { ns.method() }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Bar" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("ns", "ns.method")
        }

        @Test
        fun `should report a constructor called through a namespace import with the namespace`() {
            // Arrange
            val code = """
                import * as types from './types'
                export class Consumer {
                    log(): void { new types.Logger() }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Consumer" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("types", "types.Logger")
        }

        @Test
        fun `should report a member chain read through a namespace import as one name`() {
            // Arrange
            val code = """
                import * as types from './types'
                export class Consumer {
                    create() { return types.Animal.create() }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Consumer" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("types", "types.Animal.create")
        }
    }

    @Nested
    inner class UsedTypeEdgeCases {
        @Test
        fun `should report a free lower-case constructor as a possible global`() {
            // Arrange
            val code = "export class Foo { x = new xmlParser() }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val uses = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name to it.namespacePrefix }
            assertThat(uses).containsExactly("xmlParser" to listOf("GLOBAL"))
        }
    }

    @Nested
    inner class LocalBindings {
        private fun usedNames(code: String, declaration: String): List<String> = TreeSitterDependencies
            .analyze(code, Language.TYPESCRIPT)
            .declarations
            .single { it.name == declaration }
            .usedTypes
            .map { it.name }

        @Test
        fun `should report no use of a name a parameter binds`() {
            // Arrange
            val code = """
                import { Model } from './model'
                export function shadowed(Model: number): number { return Model }
            """.trimIndent()

            // Act
            val names = usedNames(code, "shadowed")

            // Assert
            assertThat(names).isEmpty()
        }

        @Test
        fun `should report the type of a name a parameter binds as a value`() {
            // Arrange
            val code = """
                import { Model } from './model'
                export function typed(Model: Model): void {}
            """.trimIndent()

            // Act
            val names = usedNames(code, "typed")

            // Assert
            assertThat(names).containsExactly("Model")
        }

        @Test
        fun `should report no use of a class or a variable a block declares`() {
            // Arrange
            val code = """
                import { Model, Other } from './model'
                export function local(): unknown {
                    class Model {}
                    const { Other } = { Other: 1 }
                    return new Model() + Other
                }
            """.trimIndent()

            // Act
            val names = usedNames(code, "local")

            // Assert
            assertThat(names).isEmpty()
        }

        @Test
        fun `should report no use of a name a type parameter binds`() {
            // Arrange
            val code = """
                import { Model } from './model'
                export class Box<Model> { item?: Model }
            """.trimIndent()

            // Act
            val names = usedNames(code, "Box")

            // Assert
            assertThat(names).isEmpty()
        }

        @Test
        fun `should report no use of a name a loop or a catch binds`() {
            // Arrange
            val code = """
                import { Item, Failure } from './model'
                export function each(items: number[]): void {
                    for (const Item of items) { console.log(Item) }
                    try {} catch (Failure) { console.log(Failure) }
                }
            """.trimIndent()

            // Act
            val names = usedNames(code, "each")

            // Assert
            assertThat(names).containsExactly("console")
        }

        @Test
        fun `should keep a name that a block binds out of a dynamic import or a require, the import's through its module`() {
            // Arrange
            val code = """
                export async function load() {
                    const { Centaur } = await import('./centaur')
                    const { Helper } = require('./helper')
                    return new Centaur() + new Helper()
                }
            """.trimIndent()

            // Act
            val names = usedNames(code, "load")

            // Assert
            val dynamicImport = "dynamic_import_" + code.indexOf("import('./centaur')")
            assertThat(names).containsExactlyInAnyOrder("$dynamicImport.Centaur", "Helper", "require")
        }
    }

    @Test
    fun `should report a member read through a namespace import, not one of a named import`() {
        // Arrange
        val code = """
            import * as models from './models/user'
            import { defaults } from './defaults'
            export function make(): unknown { return models.create() + defaults.size }
        """.trimIndent()

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

        // Assert
        assertThat(result.declarations.single().usedTypes.map { it.name }).containsExactlyInAnyOrder("models", "models.create", "defaults")
    }

    @Test
    fun `should report a qualified type as one name, also through a namespace import`() {
        // Arrange
        val code = """
            import * as lib from './lib'
            import { Shapes } from './geo'
            export class Draw implements lib.Drawable {
                circle?: Shapes.Circle
                shape?: lib.shapes.Square
            }
        """.trimIndent()

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

        // Assert
        assertThat(result.declarations.single().usedTypes.map { it.name }).containsExactlyInAnyOrder(
            "lib.Drawable",
            "Shapes.Circle",
            "lib.shapes.Square"
        )
    }

    @Test
    fun `should report a shorthand property as a use of the name it reads, not a destructured one`() {
        // Arrange
        val code = """
            import { format, size } from './fmt'
            export const card = {
                methods: { format },
                data() {
                    const { label } = this.props
                    return { size, label }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

        // Assert
        assertThat(result.declarations.single().usedTypes.map { it.name }).containsExactlyInAnyOrder("format", "size")
    }

    @Test
    fun `should report the default export that defineAsyncComponent loads as a use, by its specifier`() {
        // Arrange
        val code = """
            import { defineAsyncComponent } from 'vue'
            export const LazyForm = defineAsyncComponent(() => import('./Form.vue'))
            export const LazyCard = defineAsyncComponent({ loader: () => import('../ui/Card.vue'), delay: 200 })
        """.trimIndent()

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

        // Assert
        val loaded = result.declarations.associate { declaration ->
            declaration.name to declaration.usedTypes.filter { it.name == "DEFAULT_EXPORT" }.map { it.namespacePrefix }
        }
        assertThat(loaded).containsExactlyInAnyOrderEntriesOf(
            mapOf("LazyForm" to listOf(listOf(".", "Form.vue")), "LazyCard" to listOf(listOf("..", "ui", "Card.vue")))
        )
    }
}
