package de.maibornwolff.codecharta.analysers.parsers.gitlog.parser.git

internal object CoAuthorParser {
    private val coAuthorPattern = Regex("""Co-Authored-By:\s*(.+?)\s*<.*>""", RegexOption.IGNORE_CASE)
    private const val COAUTHOR_ROW_INDICATOR = "Co-authored-by:"

    fun parseCoauthors(commitMessages: List<String>): List<String> {
        return commitMessages
            .filter { it.startsWith(COAUTHOR_ROW_INDICATOR, ignoreCase = true) }
            .mapNotNull { line ->
                val coAuthor = coAuthorPattern.find(line)
                coAuthor?.groupValues?.get(1)?.trim()
            }
    }
}
