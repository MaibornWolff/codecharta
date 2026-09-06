package de.maibornwolff.treesitter.excavationsite.languages.vue

/**
 * Utility for extracting script content from Vue Single File Components.
 */
object VueScriptExtractor {
    private val SCRIPT_REGEX = Regex("""<script[^>]*>([\s\S]*?)</script>""", RegexOption.IGNORE_CASE)

    /**
     * Extracts the content inside <script> tags from a Vue SFC.
     *
     * @param content The Vue SFC content
     * @return The script content, or empty string if no script tag found
     */
    fun extractScriptContent(content: String): String {
        val match = SCRIPT_REGEX.find(content)
        return match?.groupValues?.getOrNull(1)?.trim() ?: ""
    }

    /**
     * Checks if the Vue file has a script section.
     */
    fun hasScriptSection(content: String): Boolean = SCRIPT_REGEX.containsMatchIn(content)
}
