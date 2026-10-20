package de.maibornwolff.treesitter.excavationsite.shared.domain

object StringParser {
    private const val DOUBLE_QUOTE = "\""
    private const val SINGLE_QUOTE = "'"
    private const val BACKTICK = "`"
    private const val TRIPLE_DOUBLE_QUOTE = "\"\"\""
    private const val TRIPLE_SINGLE_QUOTE = "'''"
    private const val CPP_RAW_PREFIX = "R\""
    private val PYTHON_STRING_PREFIXES = listOf(
        "fr", "rf", "br", "rb", "FR", "RF", "BR", "RB",
        "f", "r", "b", "u", "F", "R", "B", "U"
    )

    fun stripQuotes(text: String, quoteChar: String = DOUBLE_QUOTE): String = text.removeSurrounding(quoteChar)

    fun stripAnyQuotes(text: String): String = text.removeSurrounding(DOUBLE_QUOTE).removeSurrounding(SINGLE_QUOTE)

    fun stripTripleQuotes(text: String): String = when {
        text.startsWith(TRIPLE_DOUBLE_QUOTE) && text.endsWith(TRIPLE_DOUBLE_QUOTE) ->
            text.removeSurrounding(TRIPLE_DOUBLE_QUOTE)
        text.startsWith(TRIPLE_SINGLE_QUOTE) && text.endsWith(TRIPLE_SINGLE_QUOTE) ->
            text.removeSurrounding(TRIPLE_SINGLE_QUOTE)
        else -> text
    }

    fun stripBackticks(text: String): String = text.removeSurrounding(BACKTICK)

    fun stripCppRawString(text: String): String {
        if (!text.startsWith(CPP_RAW_PREFIX)) return text

        val afterPrefix = text.removePrefix(CPP_RAW_PREFIX)
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

    fun stripCSharpRawString(text: String): String {
        val quoteCount = text.takeWhile { it == '"' }.length
        val quotes = DOUBLE_QUOTE.repeat(quoteCount)
        return text.removePrefix(quotes).removeSuffix(quotes).trim()
    }

    fun stripCSharpVerbatimString(text: String): String = text.removePrefix("@\"").removeSuffix(DOUBLE_QUOTE)

    fun stripCSharpInterpolatedString(text: String): String = text.removePrefix("\$\"").removeSuffix(DOUBLE_QUOTE)

    fun stripPythonString(text: String): String {
        val stripped = removePythonStringPrefix(text)

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

    private fun removePythonStringPrefix(text: String): String {
        val prefix = PYTHON_STRING_PREFIXES.firstOrNull { isPythonStringPrefix(text, it) } ?: return text
        return text.substring(prefix.length)
    }

    private fun isPythonStringPrefix(text: String, prefix: String): Boolean =
        text.startsWith(prefix) && text.length > prefix.length && (text[prefix.length] == '"' || text[prefix.length] == '\'')

    // Indentation is normalized as JEP 378 specifies for text blocks.
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

    fun stripRubySymbol(text: String): String = text.removePrefix(":")

    fun stripRubyRegex(text: String): String = text.removePrefix("/").replace(Regex("/[imxo]*$"), "")
}
