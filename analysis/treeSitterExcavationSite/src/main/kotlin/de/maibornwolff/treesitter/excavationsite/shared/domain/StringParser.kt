package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Language-agnostic string literal parsing utilities.
 *
 * Handles stripping quotes and processing various string literal formats
 * used across programming languages.
 */
object StringParser {
    private const val DOUBLE_QUOTE = "\""
    private const val SINGLE_QUOTE = "'"
    private const val BACKTICK = "`"
    private const val TRIPLE_DOUBLE_QUOTE = "\"\"\""
    private const val TRIPLE_SINGLE_QUOTE = "'''"

    /**
     * Strips surrounding quotes from a string literal.
     *
     * @param text The string literal text including quotes
     * @param quoteChar The quote character to strip (default: double quote)
     * @return The string content without surrounding quotes
     */
    fun stripQuotes(text: String, quoteChar: String = DOUBLE_QUOTE): String = text.removeSurrounding(quoteChar)

    /**
     * Strips double or single quotes from a string literal.
     *
     * Tries double quotes first, then single quotes.
     *
     * @param text The string literal text including quotes
     * @return The string content without surrounding quotes
     */
    fun stripAnyQuotes(text: String): String = text.removeSurrounding(DOUBLE_QUOTE).removeSurrounding(SINGLE_QUOTE)

    /**
     * Strips triple quotes from a multiline string literal (Python/Kotlin style).
     *
     * @param text The string literal text including triple quotes
     * @return The string content without surrounding triple quotes
     */
    fun stripTripleQuotes(text: String): String = when {
        text.startsWith(TRIPLE_DOUBLE_QUOTE) && text.endsWith(TRIPLE_DOUBLE_QUOTE) ->
            text.removeSurrounding(TRIPLE_DOUBLE_QUOTE)
        text.startsWith(TRIPLE_SINGLE_QUOTE) && text.endsWith(TRIPLE_SINGLE_QUOTE) ->
            text.removeSurrounding(TRIPLE_SINGLE_QUOTE)
        else -> text
    }

    /**
     * Strips backticks from a template string literal (JavaScript style).
     *
     * @param text The template string text including backticks
     * @return The string content without surrounding backticks
     */
    fun stripBackticks(text: String): String = text.removeSurrounding(BACKTICK)

    /**
     * Strips C++ raw string literal format: R"delimiter(content)delimiter"
     *
     * @param text The raw string literal text
     * @return The string content without R"delimiter( prefix and )delimiter" suffix
     */
    fun stripCppRawString(text: String): String {
        val rawPrefix = "R\""
        if (!text.startsWith(rawPrefix)) return text

        val afterPrefix = text.removePrefix(rawPrefix)
        val openParen = afterPrefix.indexOf('(')
        if (openParen == -1) return text

        val delimiter = afterPrefix.substring(0, openParen)
        val closingPattern = ")$delimiter\""

        val contentStart = openParen + 1
        val contentEnd = afterPrefix.lastIndexOf(closingPattern)

        return if (contentEnd > contentStart) {
            afterPrefix.substring(contentStart, contentEnd)
        } else {
            text.removePrefix("R\"(").removeSuffix(")\"")
        }
    }

    /**
     * Strips C# raw string literal format (multiple quotes).
     *
     * C# 11 raw strings use variable quote counts: """content""" or """"content""""
     *
     * @param text The raw string literal text
     * @return The string content without surrounding quotes, trimmed
     */
    fun stripCSharpRawString(text: String): String {
        val quoteCount = text.takeWhile { it == '"' }.length
        val quotes = DOUBLE_QUOTE.repeat(quoteCount)
        return text.removePrefix(quotes).removeSuffix(quotes).trim()
    }

    /**
     * Strips C# verbatim string prefix and quotes: @"content"
     *
     * @param text The verbatim string literal text
     * @return The string content without @" prefix and " suffix
     */
    fun stripCSharpVerbatimString(text: String): String = text.removePrefix("@\"").removeSuffix(DOUBLE_QUOTE)

    /**
     * Strips C# interpolated string prefix and quotes: $"content"
     *
     * @param text The interpolated string literal text
     * @return The string content without $" prefix and " suffix
     */
    fun stripCSharpInterpolatedString(text: String): String = text.removePrefix("\$\"").removeSuffix(DOUBLE_QUOTE)

    /**
     * Strips Python string prefixes (f, r, b, u, fr, rf, br, rb) and quotes.
     *
     * @param text The string literal text including any prefix and quotes
     * @return The string content without prefix and quotes
     */
    fun stripPythonString(text: String): String {
        val prefixes = listOf(
            "fr", "rf", "br", "rb", "FR", "RF", "BR", "RB",
            "f", "r", "b", "u", "F", "R", "B", "U"
        )

        var stripped = text
        for (prefix in prefixes) {
            if (stripped.startsWith(prefix) &&
                stripped.length > prefix.length &&
                (stripped[prefix.length] == '"' || stripped[prefix.length] == '\'')
            ) {
                stripped = stripped.substring(prefix.length)
                break
            }
        }

        return when {
            stripped.startsWith(TRIPLE_DOUBLE_QUOTE) && stripped.endsWith(TRIPLE_DOUBLE_QUOTE) ->
                stripped.removeSurrounding(TRIPLE_DOUBLE_QUOTE)
            stripped.startsWith(TRIPLE_SINGLE_QUOTE) && stripped.endsWith(TRIPLE_SINGLE_QUOTE) ->
                stripped.removeSurrounding(TRIPLE_SINGLE_QUOTE)
            stripped.startsWith(DOUBLE_QUOTE) && stripped.endsWith(DOUBLE_QUOTE) ->
                stripped.removeSurrounding(DOUBLE_QUOTE)
            stripped.startsWith(SINGLE_QUOTE) && stripped.endsWith(SINGLE_QUOTE) ->
                stripped.removeSurrounding(SINGLE_QUOTE)
            else -> stripped
        }
    }

    /**
     * Extracts content from a Java text block, normalizing indentation per JEP 378.
     *
     * @param text The text block including triple quotes
     * @return The content with normalized indentation
     */
    fun extractJavaTextBlock(text: String): String {
        val content = text.removePrefix(TRIPLE_DOUBLE_QUOTE).removeSuffix(TRIPLE_DOUBLE_QUOTE)
        val lines = content.lines()
        if (lines.isEmpty()) return ""

        val contentLines = if (lines.first().isBlank()) lines.drop(1) else lines
        if (contentLines.isEmpty()) return ""

        val minIndent = contentLines
            .filter { it.isNotBlank() }
            .minOfOrNull { line -> line.takeWhile { it == ' ' || it == '\t' }.length }
            ?: 0

        return contentLines
            .joinToString("\n") { line ->
                if (line.isBlank()) "" else line.drop(minIndent)
            }.trim()
    }

    /**
     * Strips Ruby symbol prefix (:) from a simple symbol.
     *
     * @param text The symbol text including the : prefix
     * @return The symbol name without the : prefix
     */
    fun stripRubySymbol(text: String): String = text.removePrefix(":")

    /**
     * Strips Ruby regex delimiters and flags.
     *
     * @param text The regex literal text including / delimiters and flags
     * @return The regex pattern without delimiters and flags
     */
    fun stripRubyRegex(text: String): String = text.removePrefix("/").replace(Regex("/[imxo]*$"), "")
}
