package de.maibornwolff.treesitter.excavationsite.languages.rust.extractors

import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustNamespace
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * The paths in the arguments of a macro invocation, which tree-sitter leaves as tokens (`rust.md`, decision 5): `a::b`
 * and a single name are paths in any namespace, a path before `!` a macro; a name after `.` is a field or method and a
 * keyword or `$` metavariable is no path.
 */
internal object MacroTokens {
    private const val IDENTIFIER = "identifier"
    private const val SCOPE_SEPARATOR = "::"
    private const val PERIOD = "."
    private const val BANG = "!"
    private const val DOLLAR = '$'
    private val PATH_STARTS = setOf(IDENTIFIER, "self", "super", "crate")
    private val KEYWORDS = setOf(
        "as", "async", "await", "break", "const", "continue", "dyn", "else", "enum", "extern", "false", "fn", "for", "if",
        "impl", "in", "let", "loop", "match", "mod", "move", "mut", "pub", "ref", "return", "static", "struct", "trait",
        "true", "type", "unsafe", "use", "where", "while", "yield", "self", "Self"
    )

    fun read(tokenTree: SyntaxNode, add: (List<String>, RustNamespace, Int) -> Unit) {
        val tokens = leavesOf(tokenTree)
        var index = 0
        while (index < tokens.size) {
            val start = index
            val segments = mutableListOf<String>()
            if (tokens[index].type == SCOPE_SEPARATOR && tokens.getOrNull(index + 1)?.type == IDENTIFIER) {
                segments.add("")
                index++
            }
            if (tokens[index].type !in PATH_STARTS) {
                index++
                continue
            }
            index = readSegments(tokens, index, segments)
            if (isPath(segments, tokens.getOrNull(start - 1)?.type)) {
                val namespace = if (tokens.getOrNull(index)?.type == BANG) RustNamespace.MACRO else RustNamespace.ANY
                add(segments, namespace, tokens[start].startByte)
            }
        }
    }

    // The segments joined by `::` from [start] on; the index after the last one
    private fun readSegments(tokens: List<Token>, start: Int, segments: MutableList<String>): Int {
        var index = start
        segments.add(tokens[index].text)
        while (tokens.getOrNull(index + 1)?.type == SCOPE_SEPARATOR && tokens.getOrNull(index + 2)?.type in PATH_STARTS) {
            segments.add(tokens[index + 2].text)
            index += 2
        }
        return index + 1
    }

    private fun isPath(segments: List<String>, previous: String?): Boolean {
        if (previous == PERIOD || previous == SCOPE_SEPARATOR) return false
        if (segments.size == 1 && segments.single() in KEYWORDS) return false
        return segments.none { it.firstOrNull() == DOLLAR }
    }

    private data class Token(val type: String, val text: String, val startByte: Int)

    private fun leavesOf(node: SyntaxNode): List<Token> = if (node.childCount == 0 || node.type in PATH_STARTS) {
        listOf(Token(node.type, node.text, node.startByte))
    } else {
        node.children().flatMap { leavesOf(it) }.toList()
    }
}
