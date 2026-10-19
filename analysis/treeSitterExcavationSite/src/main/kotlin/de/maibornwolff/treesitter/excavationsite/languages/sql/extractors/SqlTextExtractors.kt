package de.maibornwolff.treesitter.excavationsite.languages.sql.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.CommentParser
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

private const val LINE_COMMENT = "--"
private const val HASH_COMMENT = "#"
private const val QUOTE = "'"
private const val DOLLAR = '$'
private val STRING_PREFIXES = charArrayOf('n', 'N', 'e', 'E', 'b', 'B', 'x', 'X')
private val ORACLE_QUOTE = Regex("^[nN]?[qQ]'(.)(.*)(.)'$", RegexOption.DOT_MATCHES_ALL)
private const val OPENING_DOLLAR_LENGTH = 1

/** The last part of the name a definition, parameter, variable or reference is given, unquoted. */
internal fun extractSqlName(node: SyntaxNode): String? = SqlNames.simpleNameOf(node)

/** One grammar node holds all three comment styles of SQL: `-- line`, `/* block */` and MySQL's `# line`. */
internal fun extractSqlComment(node: SyntaxNode): String {
    val text = node.text
    return when {
        text.startsWith(LINE_COMMENT) -> CommentParser.stripLineComment(text, LINE_COMMENT)
        text.startsWith(HASH_COMMENT) -> CommentParser.stripLineComment(text, HASH_COMMENT)
        else -> CommentParser.stripBlockComment(text)
    }
}

/** A string in single quotes with an optional prefix (`N'...'`, `E'...'`), or Oracle's `q'[...]'`. */
internal fun extractSqlString(node: SyntaxNode): String {
    val text = node.text
    ORACLE_QUOTE.matchEntire(text)?.let { return it.groupValues[2] }
    return text.trimStart(*STRING_PREFIXES).removeSurrounding(QUOTE).replace(QUOTE + QUOTE, QUOTE)
}

/** A PostgreSQL string between dollar quotes: `$$text$$` or `$tag$text$tag$`. */
internal fun extractSqlDollarString(node: SyntaxNode): String {
    val text = node.text
    val tagEnd = text.indexOf(DOLLAR, startIndex = OPENING_DOLLAR_LENGTH)
    if (tagEnd < 0) return text
    val tag = text.substring(0, tagEnd + 1)
    return text.removePrefix(tag).removeSuffix(tag)
}
