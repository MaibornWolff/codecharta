package de.maibornwolff.treesitter.excavationsite.languages.sql.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * Names as SQL writes them: dotted (`dbo.orders`), quoted in one of three ways (`"Orders"`, `` `orders` ``,
 * `[Orders]`), or marked as a variable (`@total`, `:new`).
 */
internal object SqlNames {
    private const val NAME_FIELD = "name"
    private const val OBJECT_NAME = "object_name"
    private val NAME_PART_TYPES = setOf("identifier", "quoted_identifier", "variable", "bind_variable", "template_expression")
    private val QUOTE_PAIRS = listOf("\"" to "\"", "`" to "`", "[" to "]")
    private val VARIABLE_MARKERS = charArrayOf('@', ':')

    /** The parts of a dotted name, unquoted. */
    fun partsOf(name: SyntaxNode): List<String> {
        if (name.type != OBJECT_NAME) return listOf(unquoted(name.text))
        return name.namedChildren().filter { it.type in NAME_PART_TYPES }.map { unquoted(it.text) }.toList()
    }

    /** The node a definition, a parameter or a reference names itself with. */
    fun nameNodeOf(node: SyntaxNode): SyntaxNode? = node.getChildByFieldName(NAME_FIELD).orNull()

    /** The last part of the name of a definition, a parameter or a reference: `orders` for `dbo.orders`. */
    fun simpleNameOf(node: SyntaxNode): String? = nameNodeOf(node)?.let { partsOf(it).lastOrNull() }

    fun unquoted(text: String): String {
        val pair = QUOTE_PAIRS.firstOrNull { (open, close) -> text.length >= 2 && text.startsWith(open) && text.endsWith(close) }
        if (pair != null) return text.substring(1, text.length - 1).replace(pair.second + pair.second, pair.second)
        return text.trimStart(*VARIABLE_MARKERS)
    }
}
