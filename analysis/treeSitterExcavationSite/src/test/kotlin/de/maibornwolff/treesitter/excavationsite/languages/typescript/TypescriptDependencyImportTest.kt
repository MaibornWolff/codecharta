package de.maibornwolff.treesitter.excavationsite.languages.typescript

import de.maibornwolff.treesitter.excavationsite.api.ImportKind
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class TypescriptDependencyImportTest {
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
        fun `should bind the name of a namespace re-export to its module and declare nothing for it`() {
            // Arrange
            val code = "export * as shapes from './shapes'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val import = result.imports.single()
            assertThat(import.path).containsExactly(".", "shapes")
            assertThat(import.isWildcard).isTrue()
            assertThat(import.kind).isEqualTo(ImportKind.REEXPORT)
            assertThat(import.bindingName).isEqualTo("shapes")
            assertThat(result.declarations).isEmpty()
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
    inner class ApiSupportCheck {
        @Test
        fun `should support TypeScript dependency analysis`() {
            assertThat(TreeSitterDependencies.isDependencyAnalysisSupported(Language.TYPESCRIPT)).isTrue()
        }
    }

    @Nested
    inner class ImportKinds {
        @Test
        fun `should mark an import that ends with the name it imports out of the module`() {
            // Arrange
            val code = """
                import Base, { Model, Other as Alias } from './model'
                import * as models from './models'
                import './polyfill'
                export { Shape } from './shape'
                export * from './all'
                const lazy = import('./lazy')
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

            // Assert
            val kindByPath = result.imports.associate { it.path.joinToString("/") to it.kind }
            assertThat(kindByPath).containsExactlyInAnyOrderEntriesOf(
                mapOf(
                    "./model/DEFAULT_EXPORT" to ImportKind.MEMBER,
                    "./model/Model" to ImportKind.MEMBER,
                    "./model/Other" to ImportKind.MEMBER,
                    "./models" to ImportKind.STANDARD,
                    "./polyfill" to ImportKind.STANDARD,
                    "./shape/Shape" to ImportKind.REEXPORT,
                    "./all" to ImportKind.REEXPORT,
                    "./lazy" to ImportKind.STANDARD
                )
            )
        }

        @Test
        fun `should mark a require that binds a name out of the module`() {
            // Arrange
            val code = """
                const { Svc, helper: help } = require('./a')
                const whole = require('./b')
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            val kindByPath = result.imports.associate { it.path.joinToString("/") to it.kind }
            assertThat(kindByPath).containsExactlyInAnyOrderEntriesOf(
                mapOf("./a/Svc" to ImportKind.MEMBER, "./a/helper" to ImportKind.MEMBER, "./b/DEFAULT_EXPORT" to ImportKind.MEMBER)
            )
        }
    }
}
