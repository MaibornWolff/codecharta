package de.maibornwolff.treesitter.excavationsite.languages.javascript

import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class JavascriptDependencyTest {
    @Nested
    inner class PackageExtraction {
        @Test
        fun `should return empty package path`() {
            // Arrange
            val code = "import { Foo } from './foo'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

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
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly(".", "foo", "Foo")
            assertThat(result.imports[0].isWildcard).isFalse()
        }

        @Test
        fun `should extract ES6 default import`() {
            // Arrange
            val code = "import Foo from './foo'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

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
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.imports[0].bindingName).isEqualTo("Foo")
        }

        @Test
        fun `should populate bindingName for CJS default import`() {
            // Arrange
            val code = "const Foo = require('./foo')"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.imports[0].bindingName).isEqualTo("Foo")
        }

        @Test
        fun `should populate bindingName with real name for non-aliased named import`() {
            // Arrange
            val code = "import { A } from './foo'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.imports[0].bindingName).isEqualTo("A")
        }

        @Test
        fun `should extract multiple named ES6 imports as separate declarations`() {
            // Arrange
            val code = "import { A, B } from './foo'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.imports).hasSize(2)
            val paths = result.imports.map { it.path }
            assertThat(paths).containsExactlyInAnyOrder(listOf(".", "foo", "A"), listOf(".", "foo", "B"))
        }

        @Test
        fun `should extract ES6 wildcard import`() {
            // Arrange
            val code = "import * as Foo from './foo'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

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
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly(".", "foo", "DEFAULT_EXPORT")
        }

        @Test
        fun `should extract CommonJS destructuring require as separate declarations`() {
            // Arrange
            val code = "const { A, B } = require('./foo')"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.imports).hasSize(2)
            val paths = result.imports.map { it.path }
            assertThat(paths).containsExactlyInAnyOrder(listOf(".", "foo", "A"), listOf(".", "foo", "B"))
        }

        @Test
        fun `should extract named re-export with alias preserving original name`() {
            // Arrange
            val code = "export { A as B } from './utils'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly(".", "utils", "A")
            assertThat(result.imports[0].bindingName).isNull()
        }

        @Test
        fun `should extract CommonJS destructuring require with renamed property`() {
            // Arrange
            val code = "const { myMethod: alias } = require('myModule')"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly("myModule", "myMethod")
            assertThat(result.imports[0].isWildcard).isFalse()
        }

        @Test
        fun `should extract dynamic import`() {
            // Arrange
            val code = "const mod = import('./utils')"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly(".", "utils")
            assertThat(result.imports[0].isWildcard).isFalse()
        }

        @Test
        fun `should extract side-effect import`() {
            // Arrange
            val code = "import './styles.css'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly(".", "styles.css")
            assertThat(result.imports[0].isWildcard).isFalse()
        }
    }

    @Nested
    inner class DeclarationExtraction {
        @Test
        fun `should extract exported class declaration`() {
            // Arrange
            val code = "export class Foo {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("Foo")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.CLASS)
        }

        @Test
        fun `should extract exported function declaration`() {
            // Arrange
            val code = "export function bar() {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("bar")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.FUNCTION)
        }

        @Test
        fun `should extract exported const declaration`() {
            // Arrange
            val code = "export const baz = 42"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("baz")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.VARIABLE)
        }

        @Test
        fun `should resolve DEFAULT_EXPORT type from locally declared identifier`() {
            // Arrange — declare-then-export-default: DEFAULT_EXPORT should inherit the declared type
            val code = """
                const buildFunction = () => { return "hello"; };
                export default buildFunction;
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            val byName = result.declarations.associateBy { it.name }
            assertThat(byName.keys).containsExactlyInAnyOrder("buildFunction", "DEFAULT_EXPORT")
            assertThat(byName["buildFunction"]?.type).isEqualTo(DeclarationType.VARIABLE)
            assertThat(byName["DEFAULT_EXPORT"]?.type).isEqualTo(DeclarationType.VARIABLE)
            assertThat(byName["DEFAULT_EXPORT"]?.usedTypes?.map { it.name }).containsExactlyInAnyOrder("buildFunction")
        }

        // JS intentionally produces both the named declaration AND a DEFAULT_EXPORT copy (same DeclarationType)
        // for `export default function/class Foo` — matching DC main's legacy JS analyzer behavior.
        // TypeScript does NOT add the DEFAULT_EXPORT copy; see JavascriptDependencyMapping.extractJsDeclarations.
        @Test
        fun `should add DEFAULT_EXPORT node alongside original for export default function`() {
            // Arrange
            val code = "export default function IssueList(props) {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert — both the named function AND a DEFAULT_EXPORT node (DC main produces both)
            val byName = result.declarations.associateBy { it.name }
            assertThat(byName.keys).containsExactlyInAnyOrder("IssueList", "DEFAULT_EXPORT")
            assertThat(byName["IssueList"]?.type).isEqualTo(DeclarationType.FUNCTION)
            assertThat(byName["DEFAULT_EXPORT"]?.type).isEqualTo(DeclarationType.FUNCTION)
        }

        @Test
        fun `should add DEFAULT_EXPORT node alongside original for export default class`() {
            // Arrange
            val code = "export default class Charts extends Component {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert — both the named class AND a DEFAULT_EXPORT node
            val byName = result.declarations.associateBy { it.name }
            assertThat(byName.keys).containsExactlyInAnyOrder("Charts", "DEFAULT_EXPORT")
            assertThat(byName["Charts"]?.type).isEqualTo(DeclarationType.CLASS)
            assertThat(byName["DEFAULT_EXPORT"]?.type).isEqualTo(DeclarationType.CLASS)
        }

        @Test
        fun `should add DEFAULT_EXPORT REEXPORT for anonymous export default class`() {
            // Arrange
            val code = "export default class {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("DEFAULT_EXPORT")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.REEXPORT)
            assertThat(result.declarations[0].usedTypes).isEmpty()
        }

        @Test
        fun `should add DEFAULT_EXPORT REEXPORT for anonymous export default function`() {
            // Arrange
            val code = "export default function() {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("DEFAULT_EXPORT")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.REEXPORT)
            assertThat(result.declarations[0].usedTypes).isEmpty()
        }

        @Test
        fun `should extract non-exported function declaration`() {
            // Arrange
            val code = "function foo() {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.declarations.map { it.name }).containsExactlyInAnyOrder("foo")
        }

        @Test
        fun `should extract non-exported class declaration`() {
            // Arrange
            val code = "class Foo {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.declarations.map { it.name }).containsExactlyInAnyOrder("Foo")
        }

        @Test
        fun `should extract declaration exported via bare exports-property assignment`() {
            // Arrange
            val code = """
                const helper = () => {}
                exports.helper = helper
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            val byName = result.declarations.associateBy { it.name }
            assertThat(byName).containsKey("helper")
            assertThat(byName["helper"]?.type).isEqualTo(DeclarationType.VARIABLE)
        }

        @Test
        fun `should extract wildcard re-export as REEXPORT declaration`() {
            // Arrange
            val code = "export * from './module'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("*")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.REEXPORT)
            assertThat(result.declarations[0].usedTypes).isEmpty()
        }

        @Test
        fun `should extract declaration defined separately from export clause`() {
            // Arrange — declare-then-export pattern; collectExportReferencedLocalNames picks up buildFunction
            val code = """
                const buildFunction = () => "hello"
                export { buildFunction }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            val byName = result.declarations.associateBy { it.name }
            assertThat(byName).containsKey("buildFunction")
            assertThat(byName["buildFunction"]?.type).isEqualTo(DeclarationType.VARIABLE)
        }

        @Test
        fun `should extract declaration exported via module-exports property assignment`() {
            // Arrange — CommonJS export pattern; extractCJSExportedNames picks up helper
            val code = """
                const helper = () => {}
                module.exports.helper = helper
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            val byName = result.declarations.associateBy { it.name }
            assertThat(byName).containsKey("helper")
            assertThat(byName["helper"]?.type).isEqualTo(DeclarationType.VARIABLE)
        }

        @Test
        fun `should produce DEFAULT_EXPORT node for export default call expression`() {
            // Arrange
            val code = "export default defineConfig({})"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("DEFAULT_EXPORT")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.REEXPORT)
        }

        @Test
        fun `should normalize default keyword to DEFAULT_EXPORT in re-export declaration usedType`() {
            // Arrange
            val code = "export { default as Mixin } from './mixin'"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("Mixin")
            assertThat(result.declarations[0].usedTypes.map { it.name }).containsExactlyInAnyOrder("DEFAULT_EXPORT")
        }
    }

    @Nested
    inner class JsxSmokeTest {
        @Test
        fun `should extract JSX component as usedType when parsing jsx file content`() {
            // Arrange
            val code = """
                export class App {
                    render() { return <MyComponent /> }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            val appDeclaration = result.declarations.first { it.name == "App" }
            assertThat(appDeclaration.usedTypes.map { it.name }).containsExactlyInAnyOrder("App", "MyComponent")
        }
    }

    @Nested
    inner class NamedImportValueUsages {
        @Test
        fun `should emit JSX component from named import as usedType`() {
            // Arrange
            val code = """
                import { ContextMenu } from './menu'
                export class App {
                    render() { return <ContextMenu /> }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "App" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("App", "ContextMenu")
        }

        @Test
        fun `should emit constructor call of named import as usedType`() {
            // Arrange
            val code = """
                import { Transform } from './transform'
                export class App {
                    build() { return new Transform() }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "App" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("App", "Transform")
        }

        @Test
        fun `should emit SCREAMING_SNAKE_CASE named import used as member access object as usedType`() {
            // Arrange
            val code = """
                import { TYPES } from './constants'
                export class App {
                    run() { return TYPES.something }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "App" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("App", "TYPES")
        }

        @Test
        fun `should emit lowercase named import used as function call as usedType`() {
            // Arrange
            val code = """
                import { releaseCache } from './cache'
                export class App {
                    run() { releaseCache() }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "App" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("App", "releaseCache")
        }

        @Test
        fun `should emit lowercase named import used as plain function call argument as usedType`() {
            // Arrange
            val code = """
                import { processData } from './utils'
                export class App {
                    run(x) { return processData(x) }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "App" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("App", "processData")
        }
    }

    @Nested
    inner class LocalDeclarationCrossReferences {
        @Test
        fun `should emit exported lowercase local function name as usedType when called in another declaration`() {
            // Arrange — buildFunction is exported but lowercase; without localDeclarationNames it would be
            // filtered out by the isUpperCase check in extractRelevantIdentifiers
            val code = """
                export function buildFunction() {}
                export function app() { return buildFunction() }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert — app's usedTypes include buildFunction but not app itself (own name is excluded)
            val usedTypeNames = result.declarations.first { it.name == "app" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("buildFunction")
        }

        @Test
        fun `should track local name from aliased export specifier when referenced in another declaration`() {
            // Arrange — export { buildFunction as helper }: localDeclarationNames must capture "buildFunction"
            // (the local name), not "helper" (the alias), so intra-file references to buildFunction resolve
            val code = """
                function buildFunction() {}
                export { buildFunction as helper }
                export function app() { return buildFunction() }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "app" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("buildFunction")
        }
    }

    @Nested
    inner class CjsAliasUsages {
        @Test
        fun `should resolve CJS destructured require alias to original name as usedType`() {
            // Arrange
            val code = """
                const { myMethod: alias } = require('./module')
                export class MyClass {
                    run() { return alias() }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert — MyClass also appears because JS class names are plain `identifier` nodes (PascalCase check)
            val usedTypeNames = result.declarations.first { it.name == "MyClass" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("MyClass", "myMethod")
        }

        @Test
        fun `should emit CJS shorthand destructured require name as usedType`() {
            // Arrange
            val code = """
                const { myMethod } = require('./module')
                export class MyClass {
                    run() { return myMethod() }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert — MyClass also appears because JS class names are plain `identifier` nodes (PascalCase check)
            val usedTypeNames = result.declarations.first { it.name == "MyClass" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("MyClass", "myMethod")
        }
    }

    @Nested
    inner class UsedTypeEdgeCases {
        // JS parser does not produce `as_expression` or `satisfies_expression` nodes — those are TS-only syntax.
        // This test confirms that plain value-position expressions do not introduce noise in usedTypes.
        @Test
        fun `should not emit usedTypes for value-position expressions in JavaScript`() {
            // Arrange
            val code = "export class Foo { run() { return doSomething() } }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).doesNotContain("doSomething")
        }

        @Test
        fun `should not emit lowercase constructor call as usedType`() {
            // Arrange
            val code = "export class Foo { x = new xmlParser() }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.JAVASCRIPT)

            // Assert
            val usedTypeNames = result.declarations.first { it.name == "Foo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).doesNotContain("xmlParser")
        }

        // JS parser does not produce `type_arguments` nodes — generic type parameters are TypeScript-only syntax.
        // No test exists for extractGenericTypeArgs in JavaScript; the JS extractor path is a no-op for this feature.
    }

    @Nested
    inner class ApiSupportCheck {
        @Test
        fun `should support JavaScript dependency analysis`() {
            assertThat(TreeSitterDependencies.isDependencyAnalysisSupported(Language.JAVASCRIPT)).isTrue()
        }
    }
}
