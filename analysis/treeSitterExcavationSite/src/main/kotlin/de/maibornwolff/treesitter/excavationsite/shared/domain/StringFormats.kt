package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Represents different string literal formats used across languages.
 */
sealed class StringFormats {
    /** Standard quoted string (double or single quotes). */
    data class Quoted(val stripSingleQuotes: Boolean = false) : StringFormats()

    /** Template string with backticks (JavaScript). */
    data object Template : StringFormats()

    /** Triple-quoted multiline string (Python, Kotlin). */
    data object TripleQuoted : StringFormats()

    /** Java text block with """. */
    data object JavaTextBlock : StringFormats()

    /** C++ raw string R"(content)". */
    data object CppRaw : StringFormats()

    /** C# raw string with multiple quotes. */
    data object CSharpRaw : StringFormats()

    /** C# verbatim string @"content". */
    data object CSharpVerbatim : StringFormats()

    /** C# interpolated string $"content". */
    data object CSharpInterpolated : StringFormats()

    /** Python string with optional prefixes (f, r, b, etc). */
    data object Python : StringFormats()

    /** Extract first child of a given type (e.g., string_content in Kotlin). */
    data class FromChild(val childType: String) : StringFormats()

    /** Plain text that should just be trimmed (e.g., heredoc body). */
    data object Trimmed : StringFormats()

    /** Regex literal with / delimiters (Swift). */
    data object Regex : StringFormats()

    /** PHP heredoc/nowdoc - drops first and last lines (delimiters). */
    data object PhpHeredoc : StringFormats()

    /** Ruby symbol with : prefix (e.g., :pending -> pending). */
    data object RubySymbol : StringFormats()
}
