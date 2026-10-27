package de.maibornwolff.treesitter.excavationsite.languages.sql.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * Reads statements the grammar leaves as a flat list of tokens (`CREATE SEQUENCE dbo.order_seq`, `ALTER TABLE orders`):
 * the words of the tokens and the dotted names they spell, which the grammar splits into identifiers, dots and names.
 */
internal object NameTokens {
    private const val OBJECT_NAME = "object_name"
    private const val DOT = "."
    private val NAME_PART_TYPES = setOf("identifier", "quoted_identifier")
    private val SKIPPED_WORDS = setOf("IF", "NOT", "EXISTS", "ONLY")
    private const val NAME_PARTS_KEPT = 2

    /** The token's text in upper case: a keyword, or an identifier or name written like one. */
    fun wordOf(token: SyntaxNode): String = token.text.uppercase()

    /** Whether the [tokens] start with the [words], an `OR REPLACE` after a leading `CREATE` left out. */
    fun startsWith(tokens: List<SyntaxNode>, vararg words: String): Boolean {
        val written = withoutOrReplace(tokens.map { wordOf(it) })
        return written.size >= words.size && words.indices.all { written[it] == words[it] }
    }

    /** The index of the first token that is the [word]. */
    fun indexOfWord(tokens: List<SyntaxNode>, word: String, from: Int = 0): Int =
        (from until tokens.size).firstOrNull { wordOf(tokens[it]) == word } ?: -1

    /**
     * The name spelled from [start] on, past `IF NOT EXISTS` and `ONLY`, in comparable parts without a database in
     * front of the schema, and the index after it; null if no name stands there.
     */
    fun nameAt(tokens: List<SyntaxNode>, start: Int): Pair<List<String>, Int>? {
        var index = start
        while (index < tokens.size && wordOf(tokens[index]) in SKIPPED_WORDS) index++
        val parts = mutableListOf<String>()
        var expectsPart = true
        while (index < tokens.size) {
            val token = tokens[index]
            when {
                expectsPart && token.type == OBJECT_NAME -> parts += SqlNames.comparablePartsOf(token)
                expectsPart && token.type in NAME_PART_TYPES -> parts += SqlNames.comparablePartOf(token.text)
                !expectsPart && token.type == DOT -> Unit
                else -> break
            }
            expectsPart = !expectsPart
            index++
        }
        return if (parts.isEmpty()) null else parts.takeLast(NAME_PARTS_KEPT) to index
    }

    private fun withoutOrReplace(words: List<String>): List<String> =
        if (words.size > 2 && words[1] == "OR" && words[2] == "REPLACE") listOf(words[0]) + words.drop(3) else words
}
