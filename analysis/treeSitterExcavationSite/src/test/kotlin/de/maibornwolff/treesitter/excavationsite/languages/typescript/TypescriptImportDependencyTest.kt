package de.maibornwolff.treesitter.excavationsite.languages.typescript

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.Arguments.argumentSet
import org.junit.jupiter.params.provider.MethodSource

class TypescriptImportDependencyTest {
    @Test
    fun `should return empty package path`() {
        // Arrange
        val code = "import { Foo } from './foo'"

        // Act
        val result = analyzeTypescript(code)

        // Assert
        assertThat(result.packagePath).isEmpty()
    }

    @Test
    fun `should return empty result for empty file`() {
        // Act
        val result = analyzeTypescript("")

        // Assert
        assertThat(result.packagePath).isEmpty()
        assertThat(result.imports).isEmpty()
        assertThat(result.declarations).isEmpty()
    }

    @ParameterizedTest
    @MethodSource("importPathCases")
    fun `should extract import paths`(code: String, expectedPaths: List<List<String>>, isWildcard: Boolean) {
        // Act
        val result = analyzeTypescript(code)

        // Assert
        assertThat(result.imports.map { it.path }).containsExactlyInAnyOrderElementsOf(expectedPaths)
        assertThat(result.imports).allMatch { it.isWildcard == isWildcard }
    }

    @ParameterizedTest
    @MethodSource("bindingNameCases")
    fun `should populate binding names`(code: String, expectedBindingNames: List<String?>) {
        // Act
        val result = analyzeTypescript(code)

        // Assert
        assertThat(result.imports.map { it.bindingName }).containsExactlyElementsOf(expectedBindingNames)
    }

    @Test
    fun `should support TypeScript dependency analysis`() {
        // Act & Assert
        assertThat(TreeSitterDependencies.isDependencyAnalysisSupported(Language.TYPESCRIPT)).isTrue()
    }

    companion object {
        @JvmStatic
        fun importPathCases(): List<Arguments> = listOf(
            argumentSet("ES6 named import", "import { Foo } from './foo'", listOf(listOf(".", "foo", "Foo")), false),
            argumentSet(
                "multiple named ES6 imports as separate declarations",
                "import { A, B } from './foo'",
                listOf(listOf(".", "foo", "A"), listOf(".", "foo", "B")),
                false
            ),
            argumentSet("ES6 default import", "import Foo from './foo'", listOf(listOf(".", "foo", "DEFAULT_EXPORT")), false),
            argumentSet("ES6 wildcard import", "import * as Foo from './foo'", listOf(listOf(".", "foo")), true),
            argumentSet(
                "aliased named import by original name",
                "import { A as Katze } from './foo'",
                listOf(listOf(".", "foo", "A")),
                false
            ),
            argumentSet("CommonJS require", "const foo = require('./foo')", listOf(listOf(".", "foo", "DEFAULT_EXPORT")), false),
            argumentSet(
                "CommonJS destructuring require as separate declarations",
                "const { A, B } = require('./foo')",
                listOf(listOf(".", "foo", "A"), listOf(".", "foo", "B")),
                false
            ),
            argumentSet(
                "CommonJS destructuring require with renamed property",
                "const { myMethod: alias } = require('myModule')",
                listOf(listOf("myModule", "myMethod")),
                false
            ),
            argumentSet(
                "CommonJS renamed destructured require by original name",
                "const { real: alias } = require('./foo')",
                listOf(listOf(".", "foo", "real")),
                false
            ),
            argumentSet(
                "multiple imports",
                """
                    import { Foo } from './foo'
                    import Bar from 'bar'
                """.trimIndent(),
                listOf(listOf(".", "foo", "Foo"), listOf("bar", "DEFAULT_EXPORT")),
                false
            ),
            argumentSet("no imports", "export class Foo {}", emptyList<List<String>>(), false),
            argumentSet(
                "multi-segment path split by slash",
                "import { Foo } from '@scope/package'",
                listOf(listOf("@scope", "package", "Foo")),
                false
            ),
            argumentSet("side-effect import", "import './styles.css'", listOf(listOf(".", "styles.css")), false),
            argumentSet("named re-export", "export { Foo } from './utils'", listOf(listOf(".", "utils", "Foo")), false),
            argumentSet(
                "multiple named re-exports as separate declarations",
                "export { A, B } from './utils'",
                listOf(listOf(".", "utils", "A"), listOf(".", "utils", "B")),
                false
            ),
            argumentSet("aliased re-export by original name", "export { A as B } from './utils'", listOf(listOf(".", "utils", "A")), false),
            argumentSet(
                "default keyword in re-export as DEFAULT_EXPORT sentinel",
                "export { default as validationMixin } from './mixins/validation.mixin'",
                listOf(listOf(".", "mixins", "validation.mixin", "DEFAULT_EXPORT")),
                false
            ),
            argumentSet("wildcard re-export", "export * from './utils'", listOf(listOf(".", "utils")), true),
            argumentSet("dynamic import", "const mod = import('./utils')", listOf(listOf(".", "utils")), false)
        )

        @JvmStatic
        fun bindingNameCases(): List<Arguments> = listOf(
            argumentSet("ES6 default import", "import Foo from './foo'", listOf("Foo")),
            argumentSet("non-aliased named import uses real name", "import { A } from './foo'", listOf("A")),
            argumentSet("aliased named import uses local alias", "import { A as Katze } from './foo'", listOf("Katze")),
            argumentSet("wildcard import", "import * as ns from './utils'", listOf("ns")),
            argumentSet("CommonJS shorthand destructured import", "const { A } = require('./foo')", listOf("A")),
            argumentSet("CommonJS renamed destructured import", "const { real: alias } = require('./foo')", listOf("alias")),
            argumentSet("named re-export has none", "export { Foo } from './utils'", listOf(null))
        )
    }
}
