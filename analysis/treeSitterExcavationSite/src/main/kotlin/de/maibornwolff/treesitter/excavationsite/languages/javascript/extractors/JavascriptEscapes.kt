package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

private const val HEX_RADIX = 16
private const val MOST_CODE_POINT_DIGITS = 6
private val ESCAPE_SEQUENCE = Regex("""\\(?:x(\p{XDigit}{2})|u(\p{XDigit}{4})|u\{(\p{XDigit}+)}|(\r\n|[\s\S]))""")
private val SINGLE_CHARACTER_ESCAPES = mapOf(
    "n" to "\n",
    "r" to "\r",
    "t" to "\t",
    "b" to "\b",
    "f" to "\u000C",
    "v" to "\u000B",
    "0" to "\u0000"
)
private val LINE_CONTINUATIONS = setOf("\n", "\r", "\r\n", "\u2028", "\u2029")

/** The text a JavaScript string or template literal stands for: `\'` is `'`, `\n` a line break, `\u00e4` an `ä`. */
internal fun unescapeJavascript(literal: String): String = ESCAPE_SEQUENCE.replace(literal) { match ->
    val (hex, unicode, codePoint, character) = match.destructured
    when {
        hex.isNotEmpty() -> hex.toInt(HEX_RADIX).toChar().toString()
        unicode.isNotEmpty() -> unicode.toInt(HEX_RADIX).toChar().toString()
        codePoint.isNotEmpty() -> characterOf(codePoint) ?: match.value
        character in LINE_CONTINUATIONS -> ""
        else -> SINGLE_CHARACTER_ESCAPES[character] ?: character
    }
}

// A code point beyond Unicode is no escape a JavaScript parser accepts, so it stays as written
private fun characterOf(codePoint: String): String? {
    val digits = codePoint.trimStart('0')
    if (digits.length > MOST_CODE_POINT_DIGITS) return null
    val value = digits.ifEmpty { "0" }.toInt(HEX_RADIX)
    return if (Character.isValidCodePoint(value)) String(Character.toChars(value)) else null
}
