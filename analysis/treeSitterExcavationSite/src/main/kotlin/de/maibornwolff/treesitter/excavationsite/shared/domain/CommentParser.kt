package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Language-agnostic comment parsing utilities.
 *
 * Handles stripping comment markers from various comment formats
 * used across programming languages.
 */
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

    /**
     * Strips line comment prefix (// or #) from comment text.
     *
     * @param text The comment text including the marker
     * @param prefix The comment prefix to strip (e.g., "//", "#")
     * @return The comment content without the prefix, trimmed
     */
    fun stripLineComment(text: String, prefix: String): String = text.removePrefix(prefix).trim()

    /**
     * Strips block comment markers (/* and */) and leading asterisks from each line.
     *
     * Handles both single-line and multi-line block comments:
     * - /* single line comment */
     * - /* multi
     *  * line
     *  * comment */
     *
     * @param text The full block comment text including markers
     * @return The comment content with markers and leading asterisks removed
     */
    fun stripBlockComment(text: String): String = text
        .removePrefix(BLOCK_COMMENT_START)
        .removeSuffix(BLOCK_COMMENT_END)
        .trim()
        .lines()
        .joinToString("\n") { line -> line.trim().removePrefix(BLOCK_COMMENT_LINE_PREFIX).trim() }
        .trim()

    /**
     * Strips doc comment markers (/** and */) and leading asterisks from each line.
     *
     * Same as [stripBlockComment] but semantic name for javadoc-style comments.
     *
     * @param text The full doc comment text including markers
     * @return The comment content with markers and leading asterisks removed
     */
    fun stripDocComment(text: String): String = stripBlockComment(text)

    /**
     * Strips XML doc comment markers (///) from C# style doc comments.
     *
     * Handles multi-line XML doc comments where each line starts with ///:
     * /// <summary>
     * /// Description here
     * /// </summary>
     *
     * @param text The full XML doc comment text
     * @return The comment content with /// prefixes removed from each line
     */
    fun stripXmlDocComment(text: String): String = text
        .lines()
        .joinToString("\n") { line -> line.trim().removePrefix(LINE_COMMENT_XML_DOC).trim() }
        .trim()

    /**
     * Strips HTML comment markers from comment text.
     *
     * @param text The comment text including <!-- and -->
     * @return The comment content without markers, trimmed
     */
    fun stripHtmlComment(text: String): String = text.removePrefix(HTML_COMMENT_START).removeSuffix(HTML_COMMENT_END).trim()

    /**
     * Strips Ruby multiline comment markers (=begin and =end).
     *
     * @param text The full multiline comment text including markers
     * @return The comment content with marker lines removed
     */
    fun stripRubyMultilineComment(text: String): String = text
        .lines()
        .filter { it.trim() != RUBY_MULTILINE_START && it.trim() != RUBY_MULTILINE_END }
        .joinToString("\n")
        .trim()

    /**
     * Determines the appropriate stripping method based on comment text and applies it.
     *
     * Automatically detects the comment format and strips the appropriate markers.
     *
     * @param text The comment text to process
     * @return The comment content with markers removed
     */
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
