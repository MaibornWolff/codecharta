package de.maibornwolff.treesitter.excavationsite.languages.vue

import de.maibornwolff.treesitter.excavationsite.languages.LanguageRegistry
import de.maibornwolff.treesitter.excavationsite.shared.domain.Language
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm.FfmSyntaxTree
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm.NativeTreeSitter
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test

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

        printAst("=== Vue AST Structure ===", code)
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

        printAst("=== Vue Script Section AST ===", code)
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

        printAst("=== Vue Comments AST ===", code)
    }

    private fun printAst(title: String, code: String) {
        val grammar = NativeTreeSitter.grammar(LanguageRegistry.getGrammarLibrary(Language.VUE))
        println(title)
        FfmSyntaxTree.parse(code, grammar).use { tree -> printAst(tree.rootNode, 0) }
    }

    private fun printAst(node: SyntaxNode, depth: Int) {
        val indent = "  ".repeat(depth)
        val nodeText = textPreview(node)
        println("$indent${node.type}${if (nodeText.isNotEmpty()) " [$nodeText]" else ""}")

        for (child in node.children()) {
            if (!child.isNull) {
                printAst(child, depth + 1)
            }
        }
    }

    private fun textPreview(node: SyntaxNode, maxLength: Int = 30): String {
        val text = node.text.replace("\n", "\\n").replace("\t", "\\t")
        return if (text.length > maxLength) text.take(maxLength) + "..." else text
    }
}
