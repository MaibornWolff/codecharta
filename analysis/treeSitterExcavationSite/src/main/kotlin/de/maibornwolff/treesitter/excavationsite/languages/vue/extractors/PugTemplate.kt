package de.maibornwolff.treesitter.excavationsite.languages.vue.extractors

/**
 * The tags of a template written in pug, which the Vue compiler turns into HTML before it reads it: the word a line
 * starts with, and the one after a `:` block expansion. A `//` comment, a text block after a tag ending in `.` and
 * every line indented below either are text, as are piped text and pug's own keywords.
 */
internal object PugTemplate {
    private const val COMMENT_START = "//"
    private val TAG = Regex("""^([A-Za-z][\w-]*)""")
    private val TAG_SUFFIX = Regex("""^(?:[.#][\w-]+)*(?:\((?:[^()"']|"[^"]*"|'[^']*')*\))?""")
    private val BLOCK_EXPANSION = Regex("""^:\s+""")
    private val TEXT_BLOCK = Regex("""^[A-Za-z][\w-]*(?:[.#][\w-]+)*(?:\(.*\))?\.\s*$""")
    private val KEYWORDS = setOf(
        "if", "else", "unless", "each", "for", "while", "case", "when", "default", "include", "extends", "block", "mixin",
        "append", "prepend", "doctype", "yield"
    )

    fun tagNamesOf(source: String): List<String> {
        val tagNames = mutableListOf<String>()
        var textIndent: Int? = null
        for (line in source.lines().filter { it.isNotBlank() }) {
            val indent = line.length - line.trimStart().length
            if (textIndent != null && indent > textIndent) continue
            val content = line.trimStart()
            textIndent = if (content.startsWith(COMMENT_START) || TEXT_BLOCK.matches(content)) indent else null
            if (!content.startsWith(COMMENT_START)) tagNames += tagsAtStartOf(content)
        }
        return tagNames
    }

    private fun tagsAtStartOf(content: String): List<String> {
        val tag = TAG.find(content)?.groupValues?.get(1)?.takeIf { it !in KEYWORDS } ?: return emptyList()
        val afterTag = content.substring(tag.length)
        val rest = afterTag.substring(TAG_SUFFIX.find(afterTag)?.value?.length ?: 0)
        val expansion = BLOCK_EXPANSION.find(rest) ?: return listOf(tag)
        return listOf(tag) + tagsAtStartOf(rest.substring(expansion.value.length))
    }
}
