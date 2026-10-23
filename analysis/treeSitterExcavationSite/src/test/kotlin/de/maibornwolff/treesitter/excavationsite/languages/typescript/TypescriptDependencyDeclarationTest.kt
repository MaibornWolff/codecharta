package de.maibornwolff.treesitter.excavationsite.languages.typescript

import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class TypescriptDependencyDeclarationTest {
    @Nested
    inner class DeclarationExtraction {
        @Test
        fun `should extract class declaration`() {
            // Arrange
            val code = "export class Foo {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("Foo")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.CLASS)
        }

        @Test
        fun `should extract interface declaration`() {
            // Arrange
            val code = "export interface IFoo {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("IFoo")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.INTERFACE)
        }

        @Test
        fun `should extract enum declaration`() {
            // Arrange
            val code = "export enum Color { RED, GREEN, BLUE }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("Color")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.ENUM)
        }

        @Test
        fun `should extract function declaration`() {
            // Arrange
            val code = "export function greet(name: string): void {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("greet")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.FUNCTION)
        }

        @Test
        fun `should extract type alias declaration as CLASS`() {
            // Arrange
            val code = "export type Id = string"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("Id")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.CLASS)
        }

        @Test
        fun `should extract const variable declaration`() {
            // Arrange
            val code = "export const greeting: string = 'hello'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("greeting")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.VARIABLE)
        }

        @Test
        fun `should extract var variable declaration`() {
            // Arrange
            val code = "export var counter = 0"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("counter")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.VARIABLE)
        }

        @Test
        fun `should extract multiple declarations`() {
            // Arrange
            val code = """
                export class Foo {}
                export interface IBar {}
                export enum Baz { A, B }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(3)
            val byName = result.declarations.associateBy { it.name }
            assertThat(byName["Foo"]?.type).isEqualTo(DeclarationType.CLASS)
            assertThat(byName["IBar"]?.type).isEqualTo(DeclarationType.INTERFACE)
            assertThat(byName["Baz"]?.type).isEqualTo(DeclarationType.ENUM)
        }

        @Test
        fun `should extract simple re-export as REEXPORT declaration`() {
            // Arrange
            val code = "export { MyReexportedClass } from './MyInternalClass'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("MyReexportedClass")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.REEXPORT)
            assertThat(result.declarations[0].usedTypes.map { it.name }).containsExactlyInAnyOrder("MyReexportedClass")
        }

        @Test
        fun `should extract aliased re-export with alias as name and original as usedType`() {
            // Arrange
            val code = "export { MyReexportedClass as MRC } from './MyInternalClass'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("MRC")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.REEXPORT)
            assertThat(result.declarations[0].usedTypes.map { it.name }).containsExactlyInAnyOrder("MyReexportedClass")
        }

        @Test
        fun `should extract default re-export with DEFAULT_EXPORT as usedType`() {
            // Arrange
            val code = "export { default as validationMixin } from './mixins/validation.mixin'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("validationMixin")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.REEXPORT)
            assertThat(result.declarations[0].usedTypes.map { it.name }).containsExactlyInAnyOrder("DEFAULT_EXPORT")
        }

        @Test
        fun `should extract one REEXPORT declaration per specifier`() {
            // Arrange
            val code = "export { A, B } from './utils'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(2)
            val byName = result.declarations.associateBy { it.name }
            assertThat(byName.keys).containsExactlyInAnyOrder("A", "B")
            assertThat(byName["A"]?.type).isEqualTo(DeclarationType.REEXPORT)
            assertThat(byName["B"]?.type).isEqualTo(DeclarationType.REEXPORT)
        }

        @Test
        fun `should extract export default identifier as REEXPORT when not declared in file`() {
            // Arrange
            val code = "export default MyDefaultExport;"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("DEFAULT_EXPORT")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.REEXPORT)
            assertThat(result.declarations[0].usedTypes.map { it.name }).containsExactlyInAnyOrder("MyDefaultExport")
        }

        @Test
        fun `should make export default of a declared identifier a DEFAULT_EXPORT re-export of that name`() {
            // Arrange
            val code = "const events = { EventEmitter }\nexport default events"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val byName = result.declarations.associateBy { it.name }
            assertThat(byName.keys).containsExactlyInAnyOrder("events", "DEFAULT_EXPORT")
            assertThat(byName["events"]?.type).isEqualTo(DeclarationType.VARIABLE)
            assertThat(byName["DEFAULT_EXPORT"]?.type).isEqualTo(DeclarationType.REEXPORT)
            assertThat(byName["DEFAULT_EXPORT"]?.usedTypes?.map { it.name }).containsExactlyInAnyOrder("events")
        }

        @Test
        fun `should make export default of a call expression a DEFAULT_EXPORT variable that uses what it names`() {
            // Arrange
            val code = "export default defineConfig({ plugin: Plugin })"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("DEFAULT_EXPORT")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.VARIABLE)
            assertThat(result.declarations[0].usedTypes.map { it.name }).containsExactly("Plugin")
        }

        @Test
        fun `should make export default of an object literal a DEFAULT_EXPORT variable`() {
            // Arrange
            val code = "export default { performance }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("DEFAULT_EXPORT")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.VARIABLE)
            assertThat(result.declarations[0].usedTypes).isEmpty()
        }

        @Test
        fun `should make an inline export default class a DEFAULT_EXPORT re-export of the class`() {
            // Arrange
            val code = "export default class Foo {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val defaultExport = result.declarations.single { it.name == "DEFAULT_EXPORT" }
            assertThat(result.declarations.map { it.name }).containsExactlyInAnyOrder("Foo", "DEFAULT_EXPORT")
            assertThat(defaultExport.type).isEqualTo(DeclarationType.REEXPORT)
            assertThat(defaultExport.usedTypes.map { it.name }).containsExactly("Foo")
        }

        @Test
        fun `should make an inline export default function a DEFAULT_EXPORT re-export of the function`() {
            // Arrange
            val code = "export default function foo() {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val defaultExport = result.declarations.single { it.name == "DEFAULT_EXPORT" }
            assertThat(result.declarations.map { it.name }).containsExactlyInAnyOrder("foo", "DEFAULT_EXPORT")
            assertThat(defaultExport.usedTypes.map { it.name }).containsExactly("foo")
        }

        @Test
        fun `should extract wildcard re-export as REEXPORT declaration`() {
            // Arrange
            val code = "export * from './utils'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("*")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.REEXPORT)
            assertThat(result.declarations[0].usedTypes).isEmpty()
        }

        @Test
        fun `should extract nested class declarations`() {
            // Arrange
            val code = """
                export class Outer {
                    inner = class Inner {}
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val names = result.declarations.map { it.name }
            assertThat(names).containsExactlyInAnyOrder("Outer")
        }

        @Test
        fun `should extract abstract class as CLASS declaration`() {
            // Arrange
            val code = "export abstract class AbstractBase { abstract doWork(): void }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("AbstractBase")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.CLASS)
        }

        @Test
        fun `should make export default of a declared abstract class a DEFAULT_EXPORT re-export of it`() {
            // Arrange
            val code = "abstract class Base {}\nexport default Base"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val byName = result.declarations.associateBy { it.name }
            assertThat(byName.keys).containsExactlyInAnyOrder("Base", "DEFAULT_EXPORT")
            assertThat(byName["DEFAULT_EXPORT"]?.type).isEqualTo(DeclarationType.REEXPORT)
            assertThat(byName["DEFAULT_EXPORT"]?.usedTypes?.map { it.name }).containsExactlyInAnyOrder("Base")
        }

        @Test
        fun `should extract generator function as FUNCTION declaration`() {
            // Arrange
            val code = "export function* generate(): Generator<number> { yield 1 }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("generate")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.FUNCTION)
        }

        @Test
        fun `should extract non-exported function declaration with its used types`() {
            // Arrange
            val code = """
                import { Logger } from './logger'

                function logVisit(visitor: string): void {
                    const logger = new Logger()
                    logger.log(visitor)
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations.map { it.name }).containsExactlyInAnyOrder("logVisit")
            val logVisit = result.declarations.first { it.name == "logVisit" }
            assertThat(logVisit.usedTypes.map { it.name }).containsExactlyInAnyOrder("Logger")
        }
    }

    @Nested
    inner class EdgeCases {
        @Test
        fun `should return empty result for empty file`() {
            // Arrange
            val code = ""

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.packagePath).isEmpty()
            assertThat(result.imports).isEmpty()
            assertThat(result.declarations).isEmpty()
        }

        @Test
        fun `should return empty declarations for imports-only file`() {
            // Arrange
            val code = "import { Foo } from './foo'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).isEmpty()
        }

        @Test
        fun `should extract multiple variable declarators from one const statement`() {
            // Arrange
            val code = "export const a: TypeA = 1, b: TypeB = 2"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val byName = result.declarations.associateBy { it.name }
            assertThat(byName).containsKeys("a", "b")
            assertThat(byName["a"]?.type).isEqualTo(DeclarationType.VARIABLE)
            assertThat(byName["b"]?.type).isEqualTo(DeclarationType.VARIABLE)
            assertThat(byName["a"]?.usedTypes?.map { it.name }).containsExactlyInAnyOrder("TypeA")
            assertThat(byName["b"]?.usedTypes?.map { it.name }).containsExactlyInAnyOrder("TypeB")
        }

        @Test
        fun `should extract used types from function declaration parameters and return type`() {
            // Arrange
            val code = "export function process(service: MyService): MyResult {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "process" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("MyService", "MyResult")
        }

        @Test
        fun `should extract declaration from exported class`() {
            // Arrange
            val code = "export class Foo {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("Foo")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.CLASS)
        }

        @Test
        fun `should extract function signature as FUNCTION type`() {
            // Arrange — function without body (e.g. overload or ambient declaration)
            val code = "export function greet(name: string): void;"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val byName = result.declarations.associateBy { it.name }
            assertThat(byName).containsKey("greet")
            assertThat(byName["greet"]?.type).isEqualTo(DeclarationType.FUNCTION)
        }

        @Test
        fun `should not extract const declaration inside function body`() {
            // Arrange
            val code = """
                export function foo() {
                    const x = 5
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val names = result.declarations.map { it.name }
            assertThat(names).containsExactlyInAnyOrder("foo")
        }

        @Test
        fun `should not extract const declaration inside class body`() {
            // Arrange
            val code = """
                export class Foo {
                    doSomething() {
                        const x = 5
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val names = result.declarations.map { it.name }
            assertThat(names).containsExactlyInAnyOrder("Foo")
        }
    }

    @Nested
    inner class AmbientModuleDeclaration {
        @Test
        fun `should extract function declaration inside declare module with parentPath`() {
            // Arrange
            val code = """
                declare module "MyModule" {
                    export function myFunction(): void;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("myFunction")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.FUNCTION)
            assertThat(result.declarations[0].parentPath).containsExactly("AMBIENT_MODULE", "MyModule")
        }

        @Test
        fun `should extract class declaration inside declare module with parentPath`() {
            // Arrange
            val code = """
                declare module "MyModule" {
                    export class MyClass {}
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("MyClass")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.CLASS)
            assertThat(result.declarations[0].parentPath).containsExactly("AMBIENT_MODULE", "MyModule")
        }

        @Test
        fun `should produce no declarations for glob pattern declare module`() {
            // Arrange
            val code = """declare module "*.md" {}"""

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).isEmpty()
        }

        @Test
        fun `should produce no declarations for empty declare module body`() {
            // Arrange
            val code = """declare module "MyModule" {}"""

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).isEmpty()
        }

        @Test
        fun `should split scoped module name into path segments for parentPath`() {
            // Arrange
            val code = """
                declare module "@scope/pkg" {
                    export function myFunction(): void;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].parentPath).containsExactly("AMBIENT_MODULE", "@scope", "pkg")
        }
    }

    @Nested
    inner class NamespaceDeclaration {
        @Test
        fun `should extract a namespace and what it exports as declarations below it`() {
            // Arrange
            val code = "export namespace EngineArgs { export type ApplyMigrations = { foo: string } }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations.map { (it.parentPath + it.name) to it.type }).containsExactlyInAnyOrder(
                listOf("EngineArgs") to DeclarationType.UNKNOWN,
                listOf("EngineArgs", "ApplyMigrations") to DeclarationType.CLASS
            )
        }

        @Test
        fun `should extract a namespace without export keyword as a declaration only its file can name`() {
            // Arrange
            val code = "namespace Foo {}\nexport class Other {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations.map { it.name to it.isFileScoped }).containsExactlyInAnyOrder("Foo" to true, "Other" to false)
        }

        @Test
        fun `should give the namespace the uses of what it does not export, and a use of such a member to the namespace`() {
            // Arrange
            val code = """
                export namespace Shapes {
                    export class Circle { center?: Point }
                    class Hidden { origin?: Origin }
                    export const unit = new Hidden()
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usesByName = result.declarations.associate { it.name to it.usedTypes.map { use -> use.name } }
            assertThat(usesByName).containsExactlyInAnyOrderEntriesOf(
                mapOf("Shapes" to listOf("Origin"), "Circle" to listOf("Point"), "unit" to listOf("Shapes"))
            )
        }
    }

    @Nested
    inner class ExportedDeclarations {
        @Test
        fun `should make a top-level declaration of a module file-scoped when the module does not export it`() {
            // Arrange
            val code = """
                class Hidden {}
                export class Shown {}
                export const visible = 1, alsoVisible = 2
                const local = 3
                function listed() {}
                function renamed() {}
                export { listed, renamed as other }
                const fallback = 4
                export default fallback
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val isFileScopedByName = result.declarations.associate { it.name to it.isFileScoped }
            assertThat(isFileScopedByName).containsAllEntriesOf(
                mapOf(
                    "Hidden" to true,
                    "Shown" to false,
                    "visible" to false,
                    "alsoVisible" to false,
                    "local" to true,
                    "listed" to false,
                    "renamed" to false,
                    "fallback" to false
                )
            )
        }

        @Test
        fun `should make no declaration of a script file-scoped`() {
            // Arrange
            val code = """
                interface Registry {}
                function legacyHelper() {}
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val isFileScopedByName = result.declarations.associate { it.name to it.isFileScoped }
            assertThat(isFileScopedByName).containsExactlyInAnyOrderEntriesOf(mapOf("Registry" to false, "legacyHelper" to false))
        }
    }

    @Nested
    inner class DeclareStatements {
        @Test
        fun `should extract what a declare statement declares`() {
            // Arrange
            val code = """
                export declare class Chart {
                    draw(): void
                }
                export declare function render(): void
                declare const VERSION: string
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val typeByName = result.declarations.associate { it.name to it.type }
            assertThat(typeByName).containsExactlyInAnyOrderEntriesOf(
                mapOf("Chart" to DeclarationType.CLASS, "render" to DeclarationType.FUNCTION, "VERSION" to DeclarationType.VARIABLE)
            )
            assertThat(result.declarations.single { it.name == "VERSION" }.isFileScoped).isTrue()
        }

        @Test
        fun `should extract what a declare statement in a declared module declares`() {
            // Arrange
            val code = """
                declare module 'legacy-lib' {
                    declare class Api {}
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations.map { it.parentPath + it.name }).containsExactly(listOf("AMBIENT_MODULE", "legacy-lib", "Api"))
        }
    }

    @Test
    fun `should extract every name a destructuring declaration binds, none it binds out of a module`() {
        // Arrange
        val code = """
            export const { left, right: other, rest: [first] } = pair
            const { Svc } = require('./svc')
        """.trimIndent()

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

        // Assert
        assertThat(result.declarations.map { it.name to it.isFileScoped }).containsExactlyInAnyOrder(
            "left" to false,
            "other" to false,
            "first" to false
        )
    }
}
