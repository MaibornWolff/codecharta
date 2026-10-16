package de.maibornwolff.treesitter.excavationsite.languages.angular.extractors

private const val HEX_RADIX = 16
private const val SEPARATOR = " "
private val HTML_ENTITY = Regex("&(?:#([0-9]+)|#[xX]([0-9a-fA-F]+)|([a-zA-Z][a-zA-Z0-9]*));")

// The named entities of the Latin-1 letters; any other named entity, such as `&nbsp;` or `&mdash;`, separates words
private val LATIN_LETTERS = mapOf(
    "Agrave" to 'À', "Aacute" to 'Á', "Acirc" to 'Â', "Atilde" to 'Ã', "Auml" to 'Ä', "Aring" to 'Å', "AElig" to 'Æ',
    "Ccedil" to 'Ç', "Egrave" to 'È', "Eacute" to 'É', "Ecirc" to 'Ê', "Euml" to 'Ë', "Igrave" to 'Ì', "Iacute" to 'Í',
    "Icirc" to 'Î', "Iuml" to 'Ï', "ETH" to 'Ð', "Ntilde" to 'Ñ', "Ograve" to 'Ò', "Oacute" to 'Ó', "Ocirc" to 'Ô',
    "Otilde" to 'Õ', "Ouml" to 'Ö', "Oslash" to 'Ø', "Ugrave" to 'Ù', "Uacute" to 'Ú', "Ucirc" to 'Û', "Uuml" to 'Ü',
    "Yacute" to 'Ý', "THORN" to 'Þ', "szlig" to 'ß', "agrave" to 'à', "aacute" to 'á', "acirc" to 'â', "atilde" to 'ã',
    "auml" to 'ä', "aring" to 'å', "aelig" to 'æ', "ccedil" to 'ç', "egrave" to 'è', "eacute" to 'é', "ecirc" to 'ê',
    "euml" to 'ë', "igrave" to 'ì', "iacute" to 'í', "icirc" to 'î', "iuml" to 'ï', "eth" to 'ð', "ntilde" to 'ñ',
    "ograve" to 'ò', "oacute" to 'ó', "ocirc" to 'ô', "otilde" to 'õ', "ouml" to 'ö', "oslash" to 'ø', "ugrave" to 'ù',
    "uacute" to 'ú', "ucirc" to 'û', "uuml" to 'ü', "yacute" to 'ý', "thorn" to 'þ', "yuml" to 'ÿ'
)

/**
 * The text with its HTML entities resolved as far as they make up words: a numeric entity of a letter or digit and a
 * named entity of a Latin-1 letter (`&ouml;`) become that character, every other entity (`&nbsp;`, `&mdash;`,
 * `&#160;`, a letter beyond Latin-1 written by name) a space between words.
 */
internal fun decodeHtmlEntities(text: String): String = HTML_ENTITY.replace(text) { match ->
    val (decimal, hexadecimal, name) = match.destructured
    when {
        decimal.isNotEmpty() -> wordCharacterOf(decimal.toIntOrNull())
        hexadecimal.isNotEmpty() -> wordCharacterOf(hexadecimal.toIntOrNull(HEX_RADIX))
        else -> LATIN_LETTERS[name]?.toString() ?: SEPARATOR
    }
}

private fun wordCharacterOf(codePoint: Int?): String {
    if (codePoint == null || !Character.isValidCodePoint(codePoint) || !Character.isLetterOrDigit(codePoint)) return SEPARATOR
    return String(Character.toChars(codePoint))
}
