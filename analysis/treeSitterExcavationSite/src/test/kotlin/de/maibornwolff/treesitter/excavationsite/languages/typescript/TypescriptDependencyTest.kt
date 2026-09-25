package de.maibornwolff.treesitter.excavationsite.languages.typescript

import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class TypescriptDependencyTest {
    @Nested
    inner class PackageExtraction {
        @Test
        fun `should return empty package path`() {
            // Arrange
            val code = "import { Foo } from './foo'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.packagePath).isEmpty()
        }
    }

    @Nested
    inner class ImportExtraction {
        @Test
        fun `should extract ES6 named import`() {
            // Arrange
            val code = "import { Foo } from './foo'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly(".", "foo", "Foo")
            assertThat(result.imports[0].isWildcard).isFalse()
        }

        @Test
        fun `should extract multiple named ES6 imports as separate declarations`() {
            // Arrange
            val code = "import { A, B } from './foo'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.imports).hasSize(2)
            val paths = result.imports.map { it.path }
            assertThat(paths).containsExactlyInAnyOrder(listOf(".", "foo", "A"), listOf(".", "foo", "B"))
            assertThat(result.imports).allMatch { !it.isWildcard }
        }

        @Test
        fun `should extract ES6 default import`() {
            // Arrange
            val code = "import Foo from './foo'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly(".", "foo", "DEFAULT_EXPORT")
            assertThat(result.imports[0].isWildcard).isFalse()
        }

        @Test
        fun `should populate bindingName for ES6 default import`() {
            // Arrange
            val code = "import Foo from './foo'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.imports[0].bindingName).isEqualTo("Foo")
        }

        @Test
        fun `should populate bindingName with real name for non-aliased named import`() {
            // Arrange
            val code = "import { A } from './foo'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.imports[0].bindingName).isEqualTo("A")
        }

        @Test
        fun `should extract ES6 wildcard import`() {
            // Arrange
            val code = "import * as Foo from './foo'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly(".", "foo")
            assertThat(result.imports[0].isWildcard).isTrue()
        }

        @Test
        fun `should extract CommonJS require`() {
            // Arrange
            val code = "const foo = require('./foo')"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly(".", "foo", "DEFAULT_EXPORT")
            assertThat(result.imports[0].isWildcard).isFalse()
        }

        @Test
        fun `should extract CommonJS destructuring require as separate declarations`() {
            // Arrange
            val code = "const { A, B } = require('./foo')"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.imports).hasSize(2)
            val paths = result.imports.map { it.path }
            assertThat(paths).containsExactlyInAnyOrder(listOf(".", "foo", "A"), listOf(".", "foo", "B"))
        }

        @Test
        fun `should extract CommonJS destructuring require with renamed property`() {
            // Arrange
            val code = "const { myMethod: alias } = require('myModule')"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly("myModule", "myMethod")
            assertThat(result.imports[0].isWildcard).isFalse()
        }

        @Test
        fun `should populate bindingName for CJS shorthand destructured import`() {
            // Arrange
            val code = "const { A } = require('./foo')"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].bindingName).isEqualTo("A")
        }

        @Test
        fun `should populate bindingName for CJS renamed destructured import`() {
            // Arrange
            val code = "const { real: alias } = require('./foo')"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly(".", "foo", "real")
            assertThat(result.imports[0].bindingName).isEqualTo("alias")
        }

        @Test
        fun `should extract multiple imports`() {
            // Arrange
            val code = """
                import { Foo } from './foo'
                import Bar from 'bar'
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.imports).hasSize(2)
        }

        @Test
        fun `should return empty imports when no imports present`() {
            // Arrange
            val code = "export class Foo {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.imports).isEmpty()
        }

        @Test
        fun `should split multi-segment import path by slash`() {
            // Arrange
            val code = "import { Foo } from '@scope/package'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.imports[0].path).containsExactly("@scope", "package", "Foo")
        }

        @Test
        fun `should extract side-effect import`() {
            // Arrange
            val code = "import './styles.css'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly(".", "styles.css")
            assertThat(result.imports[0].isWildcard).isFalse()
        }

        @Test
        fun `should extract named re-export as import`() {
            // Arrange
            val code = "export { Foo } from './utils'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly(".", "utils", "Foo")
            assertThat(result.imports[0].isWildcard).isFalse()
            assertThat(result.imports[0].bindingName).isNull()
        }

        @Test
        fun `should extract multiple named re-exports as separate declarations`() {
            // Arrange
            val code = "export { A, B } from './utils'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.imports).hasSize(2)
            val paths = result.imports.map { it.path }
            assertThat(paths).containsExactlyInAnyOrder(listOf(".", "utils", "A"), listOf(".", "utils", "B"))
        }

        @Test
        fun `should extract named re-export with alias preserving original name`() {
            // Arrange
            val code = "export { A as B } from './utils'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly(".", "utils", "A")
        }

        @Test
        fun `should map default keyword to DEFAULT_EXPORT sentinel in re-export import path`() {
            // Arrange
            val code = "export { default as validationMixin } from './mixins/validation.mixin'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly(".", "mixins", "validation.mixin", "DEFAULT_EXPORT")
            assertThat(result.imports[0].isWildcard).isFalse()
        }

        @Test
        fun `should extract wildcard re-export as import`() {
            // Arrange
            val code = "export * from './utils'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly(".", "utils")
            assertThat(result.imports[0].isWildcard).isTrue()
        }

        @Test
        fun `should extract dynamic import`() {
            // Arrange
            val code = "const mod = import('./utils')"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly(".", "utils")
            assertThat(result.imports[0].isWildcard).isFalse()
        }

        @Test
        fun `should populate bindingName with local alias for aliased named import`() {
            // Arrange
            val code = "import { A as Katze } from './foo'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly(".", "foo", "A")
            assertThat(result.imports[0].bindingName).isEqualTo("Katze")
        }

        @Test
        fun `should populate bindingName for wildcard import`() {
            // Arrange
            val code = "import * as ns from './utils'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].isWildcard).isTrue()
            assertThat(result.imports[0].bindingName).isEqualTo("ns")
        }
    }

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
        fun `should resolve DEFAULT_EXPORT type from locally declared identifier`() {
            // Arrange — declare-then-export-default: DEFAULT_EXPORT should inherit the declared type
            val code = "const events = { EventEmitter }\nexport default events"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val byName = result.declarations.associateBy { it.name }
            assertThat(byName.keys).containsExactlyInAnyOrder("events", "DEFAULT_EXPORT")
            assertThat(byName["events"]?.type).isEqualTo(DeclarationType.VARIABLE)
            assertThat(byName["DEFAULT_EXPORT"]?.type).isEqualTo(DeclarationType.VARIABLE)
            assertThat(byName["DEFAULT_EXPORT"]?.usedTypes?.map { it.name }).containsExactlyInAnyOrder("events")
        }

        @Test
        fun `should produce DEFAULT_EXPORT REEXPORT for export default call expression`() {
            // Arrange
            val code = "export default defineConfig({})"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("DEFAULT_EXPORT")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.REEXPORT)
            assertThat(result.declarations[0].usedTypes).isEmpty()
        }

        @Test
        fun `should produce DEFAULT_EXPORT REEXPORT for export default object literal`() {
            // Arrange
            val code = "export default { performance }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("DEFAULT_EXPORT")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.REEXPORT)
            assertThat(result.declarations[0].usedTypes).isEmpty()
        }

        @Test
        fun `should not produce DEFAULT_EXPORT REEXPORT for inline export default class`() {
            // Arrange
            val code = "export default class Foo {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val names = result.declarations.map { it.name }
            assertThat(names).doesNotContain("DEFAULT_EXPORT")
            assertThat(names).containsExactlyInAnyOrder("Foo")
        }

        @Test
        fun `should not produce DEFAULT_EXPORT REEXPORT for inline export default function`() {
            // Arrange
            val code = "export default function foo() {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val names = result.declarations.map { it.name }
            assertThat(names).doesNotContain("DEFAULT_EXPORT")
            assertThat(names).containsExactlyInAnyOrder("foo")
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
        fun `should resolve DEFAULT_EXPORT type from locally declared abstract class`() {
            // Arrange — declare-then-export-default: DEFAULT_EXPORT should inherit CLASS from Base
            val code = "abstract class Base {}\nexport default Base"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val byName = result.declarations.associateBy { it.name }
            assertThat(byName.keys).containsExactlyInAnyOrder("Base", "DEFAULT_EXPORT")
            assertThat(byName["DEFAULT_EXPORT"]?.type).isEqualTo(DeclarationType.CLASS)
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
        fun `should not extract lowercase object from member access`() {
            // Arrange
            val code = "export class Foo { bar() { return myModule.value } }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).doesNotContain("myModule")
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
        fun `should not extract lowercase identifiers`() {
            // Arrange
            val code = "export class Foo { bar() { return myFactory } }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).doesNotContain("myFactory")
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
            assertThat(result.declarations[0].parentPath).containsExactly("MyModule")
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
            assertThat(result.declarations[0].parentPath).containsExactly("MyModule")
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
            assertThat(result.declarations[0].parentPath).containsExactly("@scope", "pkg")
        }
    }

    @Nested
    inner class NamespaceDeclaration {
        @Test
        fun `should extract namespace declaration as UNKNOWN type`() {
            // Arrange
            val code = "export namespace EngineArgs { export type ApplyMigrations = { foo: string } }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val byName = result.declarations.associateBy { it.name }
            assertThat(byName).containsKey("EngineArgs")
            assertThat(byName["EngineArgs"]?.type).isEqualTo(DeclarationType.UNKNOWN)
            assertThat(byName["EngineArgs"]?.usedTypes).isEmpty()
        }

        @Test
        fun `should not extract namespace declaration without export keyword`() {
            // Arrange
            val code = "namespace Foo {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.declarations).isEmpty()
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
            assertThat(usedTypeNames).containsExactlyInAnyOrder("UserService")
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
        fun `should recognize lowercase namespace alias usages as usedType`() {
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
            assertThat(usedTypeNames).containsExactlyInAnyOrder("ns")
        }

        @Test
        fun `should extract class name from namespace alias constructor call`() {
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
            assertThat(usedTypeNames).containsExactlyInAnyOrder("types", "Logger")
        }

        @Test
        fun `should extract class name from namespace alias member access`() {
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
            assertThat(usedTypeNames).containsExactlyInAnyOrder("types", "Animal")
        }
    }

    @Nested
    inner class UsedTypeEdgeCases {
        @Test
        fun `should not emit lowercase constructor call as usedType`() {
            // Arrange
            val code = "export class Foo { x = new xmlParser() }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).doesNotContain("xmlParser")
        }
    }

    @Nested
    inner class ApiSupportCheck {
        @Test
        fun `should support TypeScript dependency analysis`() {
            assertThat(TreeSitterDependencies.isDependencyAnalysisSupported(Language.TYPESCRIPT)).isTrue()
        }
    }
}
