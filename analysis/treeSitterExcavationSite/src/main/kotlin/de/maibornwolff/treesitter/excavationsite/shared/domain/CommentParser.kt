package de.maibornwolff.treesitter.excavationsite.shared.domain

object CommentParser {
    private const val LINE_COMMENT_SLASH = "//"
    private const val LINE_COMMENT_HASH = "#"
    private const val LINE_COMMENT_XML_DOC = "///"
    private const val BLOCK_COMMENT_START = "/*"
    private const val BLOCK_COMMENT_END = "*/"
    private const val BLOCK_COMMENT_LINE_PREFIX = "*"
    private const val HTML_COMMENT_START = "<!--"
    private const val HTML_COMMENT_END = "-->"
    private const val RUBY_MULTILINE_START = "=begin"
    private const val RUBY_MULTILINE_END = "=end"

    fun stripLineComment(text: String, prefix: String): String = text.removePrefix(prefix).trim()

    fun stripBlockComment(text: String): String = text
        .removePrefix(BLOCK_COMMENT_START)
        .removeSuffix(BLOCK_COMMENT_END)
        .trim()
        .lines()
        .joinToString("\n") { line -> line.trim().removePrefix(BLOCK_COMMENT_LINE_PREFIX).trim() }
        .trim()

    fun stripDocComment(text: String): String = stripBlockComment(text)

    fun stripXmlDocComment(text: String): String = text
        .lines()
        .joinToString("\n") { line -> line.trim().removePrefix(LINE_COMMENT_XML_DOC).trim() }
        .trim()

    fun stripHtmlComment(text: String): String = text.removePrefix(HTML_COMMENT_START).removeSuffix(HTML_COMMENT_END).trim()

    fun stripRubyMultilineComment(text: String): String = text
        .lines()
        .filter { it.trim() != RUBY_MULTILINE_START && it.trim() != RUBY_MULTILINE_END }
        .joinToString("\n")
        .trim()

    fun stripCommentMarkers(text: String): String = when {
        text.startsWith(LINE_COMMENT_XML_DOC) -> stripXmlDocComment(text)
        text.startsWith(LINE_COMMENT_SLASH) -> stripLineComment(text, LINE_COMMENT_SLASH)
        text.startsWith(LINE_COMMENT_HASH) -> stripLineComment(text, LINE_COMMENT_HASH)
        text.startsWith(BLOCK_COMMENT_START) && text.endsWith(BLOCK_COMMENT_END) -> stripBlockComment(text)
        text.startsWith(HTML_COMMENT_START) && text.endsWith(HTML_COMMENT_END) -> stripHtmlComment(text)
        text.startsWith(RUBY_MULTILINE_START) && text.trimEnd().endsWith(RUBY_MULTILINE_END) ->
            stripRubyMultilineComment(text)
        else -> text
    }
}
