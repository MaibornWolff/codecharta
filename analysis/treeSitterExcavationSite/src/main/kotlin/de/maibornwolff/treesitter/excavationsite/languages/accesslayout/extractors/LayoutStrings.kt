package de.maibornwolff.treesitter.excavationsite.languages.accesslayout.extractors

/**
 * A string as `SaveAsText` writes it: in quotes, with a backslash in front of a quote or backslash and a line break as
 * octal codes (`\015\012`).
 */
internal object LayoutStrings {
    private const val QUOTE = '"'
    private const val ESCAPE = '\\'
    private const val OCTAL_DIGITS = 3
    private const val OCTAL_RADIX = 8

    fun unquote(written: String): String {
        val inner = written.removePrefix(QUOTE.toString()).removeSuffix(QUOTE.toString())
        val text = StringBuilder()
        var index = 0
        while (index < inner.length) {
            val character = inner[index]
            if (character != ESCAPE || index + 1 == inner.length) {
                text.append(character)
                index++
                continue
            }
            index += appendEscaped(inner, index + 1, text)
        }
        return text.toString()
    }

    // Returns the characters the escape sequence takes up, its backslash included
    private fun appendEscaped(inner: String, start: Int, text: StringBuilder): Int {
        val octal = inner.substring(start, minOf(start + OCTAL_DIGITS, inner.length))
        if (octal.length == OCTAL_DIGITS && octal.all { it in '0'..'7' }) {
            text.append(octal.toInt(OCTAL_RADIX).toChar())
            return 1 + OCTAL_DIGITS
        }
        text.append(inner[start])
        return 2
    }
}
