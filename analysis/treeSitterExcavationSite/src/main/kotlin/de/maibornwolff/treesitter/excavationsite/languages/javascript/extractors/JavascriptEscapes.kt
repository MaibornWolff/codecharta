package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

private const val HEX_RADIX = 16
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
        codePoint.isNotEmpty() -> String(Character.toChars(codePoint.toInt(HEX_RADIX)))
        character in LINE_CONTINUATIONS -> ""
        else -> SINGLE_CHARACTER_ESCAPES[character] ?: character
    }
}
