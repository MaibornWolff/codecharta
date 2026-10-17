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
    private const val DOUBLE_QUOTE = "\""
    private val QUOTE_PAIRS = listOf(DOUBLE_QUOTE to DOUBLE_QUOTE, "`" to "`", "[" to "]")
    private val VARIABLE_MARKERS = charArrayOf('@', ':')

    /** The parts of a dotted name, unquoted. */
    fun partsOf(name: SyntaxNode): List<String> = namePartTexts(name).map { unquoted(it) }

    /**
     * The parts of a dotted name as the database compares them. An unquoted name folds to lower case, and so does a
     * name in brackets or backticks, which T-SQL and MySQL compare without regard to case. A name in double quotes
     * keeps its case, unless it is written all in one case: then it is what an unquoted name folds to, in lower case
     * in PostgreSQL and in upper case in Oracle, and matches that unquoted name.
     */
    fun comparablePartsOf(name: SyntaxNode): List<String> = namePartTexts(name).map { comparable(it) }

    // A SQL*Plus substitution variable (`&schema.`) is no part of a name
    private fun namePartTexts(name: SyntaxNode): List<String> {
        if (name.type != OBJECT_NAME) return listOf(name.text)
        return name.namedChildren().filter { it.type in NAME_PART_TYPES }.map { it.text }.toList()
    }

    private fun comparable(text: String): String {
        val name = unquoted(text)
        val isQuotedInMixedCase = text.startsWith(DOUBLE_QUOTE) && name != name.lowercase() && name != name.uppercase()
        return if (isQuotedInMixedCase) name else name.lowercase()
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
