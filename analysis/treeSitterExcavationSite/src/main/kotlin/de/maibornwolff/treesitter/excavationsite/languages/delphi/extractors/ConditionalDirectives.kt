package de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors

/**
 * The conditional compiler directives of a Delphi source (`{$IFDEF X}`, `{$ELSE}`, `{$ENDIF}`, also as `(*$IF …*)`)
 * become spaces, newlines kept: the grammar takes one between a routine's heading and its local declarations for the
 * end of the routine, and both branches count anyway (`delphi.md`, not supported).
 */
internal object ConditionalDirectives {
    private const val KEYWORDS = "IFDEF|IFNDEF|IFOPT|IF|ELSEIF|ELSE|ENDIF|IFEND"
    private val DIRECTIVES =
        Regex("""\{\$(?:$KEYWORDS)\b[^}]*}|\(\*\$(?:$KEYWORDS)\b.*?\*\)""", setOf(RegexOption.IGNORE_CASE, RegexOption.DOT_MATCHES_ALL))

    fun blank(content: String): String {
        if (!content.contains('$')) return content
        return DIRECTIVES.replace(content) { directive -> directive.value.replace(Regex("[^\\r\\n]"), " ") }
    }
}
