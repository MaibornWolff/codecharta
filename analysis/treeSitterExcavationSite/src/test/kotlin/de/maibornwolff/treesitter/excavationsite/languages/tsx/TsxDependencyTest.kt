package de.maibornwolff.treesitter.excavationsite.languages.tsx

import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class TsxDependencyTest {
    @Nested
    inner class PackageExtraction {
        @Test
        fun `should return empty package path`() {
            // Arrange
            val code = "import { Foo } from './foo'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            assertThat(result.packagePath).isEmpty()
        }
    }

    @Nested
    inner class ImportExtraction {
        @Test
        fun `should extract ES6 named import`() {
            // Arrange
            val code = "import { Routes } from 'react-router-dom'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly("react-router-dom", "Routes")
        }

        @Test
        fun `should extract default import with DEFAULT_EXPORT path segment`() {
            // Arrange
            val code = "import MyComponent from './MyComponent'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly(".", "MyComponent", "DEFAULT_EXPORT")
        }

        @Test
        fun `should extract wildcard re-export as wildcard import`() {
            // Arrange
            val code = "export * from './utils'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly(".", "utils")
            assertThat(result.imports[0].isWildcard).isTrue()
        }

        @Test
        fun `should extract side-effect import`() {
            // Arrange
            val code = "import './styles.css'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly(".", "styles.css")
            assertThat(result.imports[0].isWildcard).isFalse()
        }

        @Test
        fun `should extract named re-export alias as import preserving original name`() {
            // Arrange
            val code = "export { MyReexportedClass as MRC } from './MyInternalClass'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly(".", "MyInternalClass", "MyReexportedClass")
        }

        @Test
        fun `should extract CommonJS require`() {
            // Arrange
            val code = "const foo = require('./foo')"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly(".", "foo", "DEFAULT_EXPORT")
            assertThat(result.imports[0].isWildcard).isFalse()
        }

        @Test
        fun `should extract dynamic import`() {
            // Arrange
            val code = "const mod = import('./utils')"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly(".", "utils")
            assertThat(result.imports[0].isWildcard).isFalse()
        }
    }

    @Nested
    inner class DeclarationExtraction {
        @Test
        fun `should extract class declaration`() {
            // Arrange
            val code = "export class MyComponent {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("MyComponent")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.CLASS)
        }

        @Test
        fun `should extract interface declaration`() {
            // Arrange
            val code = "export interface IFoo {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("IFoo")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.INTERFACE)
        }

        @Test
        fun `should extract function declaration`() {
            // Arrange
            val code = "export function render() {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("render")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.FUNCTION)
        }

        @Test
        fun `should extract enum declaration`() {
            // Arrange
            val code = "export enum Color { Red, Green, Blue }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("Color")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.ENUM)
        }

        @Test
        fun `should extract type alias declaration`() {
            // Arrange
            val code = "export type Foo = Bar | Baz"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("Foo")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.CLASS)
        }

        @Test
        fun `should extract variable declaration`() {
            // Arrange
            val code = "export const value = 42"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("value")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.VARIABLE)
        }

        @Test
        fun `should extract abstract class as CLASS declaration`() {
            // Arrange
            val code = "export abstract class AbstractBase { abstract doWork(): void }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("AbstractBase")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.CLASS)
        }

        @Test
        fun `should extract namespace declaration as UNKNOWN type`() {
            // Arrange
            val code = "export namespace EngineArgs { export type ApplyMigrations = { foo: string } }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            val byName = result.declarations.associateBy { it.name }
            assertThat(byName).containsKey("EngineArgs")
            assertThat(byName["EngineArgs"]?.type).isEqualTo(DeclarationType.UNKNOWN)
        }

        @Test
        fun `should extract function declaration inside declare module with parentPath`() {
            // Arrange
            val code = """
                declare module "MyModule" {
                    export function myFunction(): void;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("myFunction")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.FUNCTION)
            assertThat(result.declarations[0].parentPath).containsExactly("MyModule")
        }

        @Test
        fun `should extract aliased re-export with alias as name and original as usedType`() {
            // Arrange
            val code = "export { MyReexportedClass as MRC } from './MyInternalClass'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("MRC")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.REEXPORT)
            assertThat(result.declarations[0].usedTypes.map { it.name }).containsExactlyInAnyOrder("MyReexportedClass")
        }
    }

    @Nested
    inner class JsxUsedTypeExtraction {
        @Test
        fun `should extract uppercase JSX self-closing element as usedType`() {
            // Arrange
            val code = """
                export class Foo {
                    render() { return <Routes /> }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            val fooDeclaration = result.declarations.first { it.name == "Foo" }
            assertThat(fooDeclaration.usedTypes.map { it.name }).containsExactlyInAnyOrder("Routes")
        }

        @Test
        fun `should extract only root identifier for member JSX element`() {
            // Arrange
            val code = """
                export class Foo {
                    render() { return <Form.Input /> }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            val fooDeclaration = result.declarations.first { it.name == "Foo" }
            assertThat(fooDeclaration.usedTypes.map { it.name }).containsExactlyInAnyOrder("Form")
        }

        @Test
        fun `should not extract lowercase HTML element as usedType`() {
            // Arrange
            val code = """
                export class Foo {
                    render() { return <div /> }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            val fooDeclaration = result.declarations.first { it.name == "Foo" }
            assertThat(fooDeclaration.usedTypes.map { it.name }).doesNotContain("div")
        }

        @Test
        fun `should extract uppercase JSX opening element as usedType`() {
            // Arrange
            val code = """
                export class Foo {
                    render() { return <MyComponent>child</MyComponent> }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            val fooDeclaration = result.declarations.first { it.name == "Foo" }
            assertThat(fooDeclaration.usedTypes.map { it.name }).containsExactlyInAnyOrder("MyComponent")
        }
    }

    @Nested
    inner class UsedTypeExtraction {
        @Test
        fun `should extract type from type annotation`() {
            // Arrange
            val code = "export class Foo { field: MyService }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("MyService")
        }

        @Test
        fun `should extract type from constructor call`() {
            // Arrange
            val code = "export class Foo { bar() { return new MyService() } }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("MyService")
        }

        @Test
        fun `should extract extends clause type`() {
            // Arrange
            val code = "export class Foo extends Bar {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("Bar")
        }

        @Test
        fun `should extract implements clause types`() {
            // Arrange
            val code = "export class Foo implements IBar, IBaz {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("IBar", "IBaz")
        }

        @Test
        fun `should resolve import alias to original type name in usedTypes`() {
            // Arrange
            val code = """
                import { MyType as MyRenamedType } from './MyType'
                export class Foo { field: MyRenamedType }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("MyType")
        }

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
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Handler" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("Response")
        }
    }

    @Nested
    inner class EdgeCases {
        @Test
        fun `should return empty result for empty file`() {
            // Arrange
            val code = ""

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

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
            val result = TreeSitterDependencies.analyze(code, Language.TSX)

            // Assert
            assertThat(result.declarations).isEmpty()
        }
    }

    @Nested
    inner class ApiSupportCheck {
        @Test
        fun `should support TSX dependency analysis`() {
            assertThat(TreeSitterDependencies.isDependencyAnalysisSupported(Language.TSX)).isTrue()
        }
    }
}
