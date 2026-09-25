package de.maibornwolff.treesitter.excavationsite.languages.vue

import de.maibornwolff.treesitter.excavationsite.languages.LanguageRegistry
import de.maibornwolff.treesitter.excavationsite.shared.domain.Language
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeSitterParser
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.treesitter.TSNode

/**
 * Exploration tests to understand the Vue AST structure.
 * These tests are disabled by default and used for development.
 */
class VueAstExplorationTest {
    @Test
    @Disabled("Exploration test - enable when needed to examine AST")
    fun `explore Vue AST structure for basic component`() {
        val code = """
            <template>
              <div>
                <p v-if="show">Hello {{ name }}</p>
                <button @click="handleClick">Click me</button>
              </div>
            </template>

            <script>
            export default {
              data() {
                return {
                  name: 'World',
                  show: true
                }
              },
              methods: {
                handleClick() {
                  if (this.show) {
                    console.log('clicked');
                  }
                }
              }
            }
            </script>

            <style>
            p { color: red; }
            </style>
        """.trimIndent()

        val language = LanguageRegistry.getTreeSitterLanguage(Language.VUE)
        val root = TreeSitterParser.parse(code, language)

        println("=== Vue AST Structure ===")
        printAst(root, code, 0)
    }

    @Test
    @Disabled("Exploration test - enable when needed to examine AST")
    fun `explore Vue AST for script section functions`() {
        val code = """
            <script>
            function foo() {
              if (x > 0) {
                return x;
              }
            }

            const bar = () => {
              while (true) {
                break;
              }
            }
            </script>
        """.trimIndent()

        val language = LanguageRegistry.getTreeSitterLanguage(Language.VUE)
        val root = TreeSitterParser.parse(code, language)

        println("=== Vue Script Section AST ===")
        printAst(root, code, 0)
    }

    @Test
    @Disabled("Exploration test - enable when needed to examine AST")
    fun `explore Vue AST for comments`() {
        val code = """
            <script>
            // line comment
            /* block comment */
            function test() {
              // inline comment
              return 1;
            }
            </script>
        """.trimIndent()

        val language = LanguageRegistry.getTreeSitterLanguage(Language.VUE)
        val root = TreeSitterParser.parse(code, language)

        println("=== Vue Comments AST ===")
        printAst(root, code, 0)
    }

    private fun printAst(node: TSNode, code: String, depth: Int) {
        val indent = "  ".repeat(depth)
        val nodeText = getNodeTextPreview(node, code)
        println("$indent${node.type}${if (nodeText.isNotEmpty()) " [$nodeText]" else ""}")

        for (child in node.children()) {
            if (!child.isNull) {
                printAst(child, code, depth + 1)
            }
        }
    }

    private fun buildAstString(node: TSNode, code: String, depth: Int, sb: StringBuilder) {
        val indent = "  ".repeat(depth)
        val nodeText = getNodeTextPreview(node, code)
        sb.appendLine("$indent${node.type}${if (nodeText.isNotEmpty()) " [$nodeText]" else ""}")

        for (child in node.children()) {
            if (!child.isNull) {
                buildAstString(child, code, depth + 1, sb)
            }
        }
    }

    private fun getNodeTextPreview(node: TSNode, code: String, maxLength: Int = 30): String {
        val bytes = code.toByteArray(Charsets.UTF_8)
        val start = node.startByte
        val end = node.endByte
        val text = String(bytes, start, end - start, Charsets.UTF_8)
            .replace("\n", "\\n")
            .replace("\t", "\\t")

        return if (text.length > maxLength) text.take(maxLength) + "..." else text
    }
}
