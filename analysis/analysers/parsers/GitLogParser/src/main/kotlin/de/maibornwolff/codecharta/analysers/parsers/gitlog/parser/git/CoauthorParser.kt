package de.maibornwolff.codecharta.analysers.parsers.gitlog.parser.git

internal object CoauthorParser {
    private val COAUTHOR_PATTERN = Regex("""Co-Authored-By:\s*(.+?)\s*<.*>""", RegexOption.IGNORE_CASE)
    const val CO_AUTHOR_ROW_INDICATOR = "Co-authored-by:"

    fun parseCoauthors(commitMessages: List<String>): List<String> {
        return commitMessages
            .filter { it.startsWith(CO_AUTHOR_ROW_INDICATOR, ignoreCase = true) }
            .mapNotNull { line ->
                val match = COAUTHOR_PATTERN.find(line)
                match?.groupValues?.get(1)?.trim()
            }
    }
}
