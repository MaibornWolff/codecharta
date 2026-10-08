package de.maibornwolff.treesitter.excavationsite.languages.vue

import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.tuple
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class VueDependencyTest {
    private fun analyze(code: String) = TreeSitterDependencies.analyze(code, Language.VUE)

    private fun usedComponentsOf(code: String): List<String> = analyze(code).declarations.single().usedTypes.map { it.name }

    @Nested
    inner class ApiSupportCheck {
        @Test
        fun `should report Vue as dependency-supported`() {
            // Arrange & Act
            val supported = TreeSitterDependencies.isDependencyAnalysisSupported(Language.VUE)

            // Assert
            assertThat(supported).isTrue()
        }
    }

    @Nested
    inner class ComponentDeclaration {
        @Test
        fun `should extract one class named as the default export without a package path`() {
            // Arrange
            val code = "<template><div/></template>"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.packagePath).isEmpty()
            assertThat(
                result.declarations
            ).extracting({ it.name }, { it.type }).containsExactly(tuple("DEFAULT_EXPORT", DeclarationType.CLASS))
        }

        @Test
        fun `should extract a component for a file without a template`() {
            // Arrange
            val code = "<script>export default {}</script>"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.declarations.single().usedTypes).isEmpty()
        }
    }

    @Nested
    inner class TemplateComponents {
        @Test
        fun `should extract the tags that are no HTML elements in Pascal case`() {
            // Arrange
            val code = """
                <template>
                  <div class="page">
                    <order-list :orders="orders"/>
                    <InvoiceTable></InvoiceTable>
                    <span>total</span>
                  </div>
                </template>
            """.trimIndent()

            // Act
            val usedComponents = usedComponentsOf(code)

            // Assert
            assertThat(usedComponents).containsExactly("OrderList", "InvoiceTable")
        }

        @Test
        fun `should extract a component once however often and however it is written`() {
            // Arrange
            val code = "<template><order-list/><OrderList/><order-list></order-list></template>"

            // Act
            val usedComponents = usedComponentsOf(code)

            // Assert
            assertThat(usedComponents).containsExactly("OrderList")
        }

        @Test
        fun `should extract a component inside a nested template but none inside a comment`() {
            // Arrange
            val code = """
                <template>
                  <template v-if="visible"><router-link to="/">home</router-link></template>
                  <!-- <removed-widget/> -->
                </template>
            """.trimIndent()

            // Act
            val usedComponents = usedComponentsOf(code)

            // Assert
            assertThat(usedComponents).containsExactly("RouterLink")
        }

        @Test
        fun `should treat an HTML element in upper case as HTML`() {
            // Arrange
            val code = "<template><DIV><Button/></DIV></template>"

            // Act
            val usedComponents = usedComponentsOf(code)

            // Assert
            assertThat(usedComponents).isEmpty()
        }

        @Test
        fun `should extract a component from a deeply nested template`() {
            // Arrange
            val depth = 20_000
            val code = "<template>" + "<div>".repeat(depth) + "<order-list/>" + "</div>".repeat(depth) + "</template>"

            // Act
            val usedComponents = usedComponentsOf(code)

            // Assert
            assertThat(usedComponents).containsExactly("OrderList")
        }
    }

    @Nested
    inner class ScriptImports {
        @Test
        fun `should extract the imports of a script block`() {
            // Arrange
            val code = """
                <script>
                import OrderList from './OrderList.vue'
                import { total } from '../billing'
                </script>
            """.trimIndent()

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.imports.map { it.path }).containsExactly(
                listOf(".", "OrderList.vue", "DEFAULT_EXPORT"),
                listOf("..", "billing", "total")
            )
        }

        @Test
        fun `should extract the imports of a script block and of a script setup block in source order`() {
            // Arrange
            val code = """
                <script>
                import { defaults } from './defaults'
                </script>
                <script setup>
                import { ref } from 'vue'
                </script>
            """.trimIndent()

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.imports.map { it.path }).containsExactly(listOf(".", "defaults", "defaults"), listOf("vue", "ref"))
        }

        @Test
        fun `should parse a script block with a quoted lang attribute as TypeScript`() {
            // Arrange
            val code = """
                <script lang="ts">
                import type { Order } from './order'
                const latest = <Order>{}
                </script>
            """.trimIndent()

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.imports.map { it.path }).containsExactly(listOf(".", "order", "Order"))
        }

        @Test
        fun `should not extract what a script block declares`() {
            // Arrange
            val code = "<script>export class Helper {}</script>"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.declarations.map { it.name }).containsExactly("DEFAULT_EXPORT")
        }

        @Test
        fun `should extract no imports from an empty script block`() {
            // Arrange
            val code = "<script>\n</script>"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.imports).isEmpty()
        }
    }
}
