package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import de.maibornwolff.treesitter.excavationsite.shared.domain.GrammarLibrary
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import org.junit.jupiter.api.Test
import java.io.File

// Throwaway: dumps the trees of the files listed in $TREE_DUMP_IN (grammar:path per line) to $TREE_DUMP_OUT
class ScratchTreeDumpTest {
    @Test
    fun dump() {
        val input = System.getenv("TREE_DUMP_IN") ?: return
        val out = StringBuilder()
        File(input).readLines().filter { it.isNotBlank() }.forEach { line ->
            val (grammar, path) = line.split(":", limit = 2)
            out.append("##### $path\n")
            FfmSyntaxTree.parse(File(path).readText(), NativeTreeSitter.grammar(GrammarLibrary(grammar))).use { tree ->
                print(tree.rootNode, 0, null, out)
            }
        }
        File(System.getenv("TREE_DUMP_OUT")).writeText(out.toString())
    }

    private fun print(node: SyntaxNode, depth: Int, field: String?, out: StringBuilder) {
        val text = if (node.childCount == 0) " '" + node.text.replace("\n", "\\n") + "'" else ""
        out.append("  ".repeat(depth) + (field?.let { "$it: " } ?: "") + node.type + text + "\n")
        for (index in 0 until node.childCount) {
            print(node.getChild(index), depth + 1, fieldOf(node, index), out)
        }
    }

    private fun fieldOf(node: SyntaxNode, index: Int): String? = FIELDS.firstOrNull { name ->
        val child = node.getChildByFieldName(name)
        !child.isNull &&
            child.startByte == node.getChild(index).startByte &&
            child.endByte == node.getChild(index).endByte &&
            child.type == node.getChild(index).type
    }

    companion object {
        private val FIELDS = listOf(
            "name", "body", "value", "left", "right", "function", "arguments", "object", "property", "declaration",
            "source", "parameters", "type_parameters", "type", "pattern", "alias", "return_type", "key", "label", "constraint"
        )
    }
}
