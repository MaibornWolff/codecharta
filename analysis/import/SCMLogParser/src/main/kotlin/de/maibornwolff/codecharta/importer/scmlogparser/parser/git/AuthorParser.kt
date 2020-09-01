package de.maibornwolff.codecharta.importer.scmlogparser.parser.git

internal object AuthorParser {
    const val AUTHOR_ROW_INDICATOR = "Author: "
    private const val AUTHOR_ROW_BEGIN_OF_EMAIL = '<'

    fun parseAuthor(authorLine: String): String {
        val authorWithEmail = authorLine.removePrefix(AUTHOR_ROW_INDICATOR)
        return authorWithEmail.substringBefore(AUTHOR_ROW_BEGIN_OF_EMAIL).trim()
    }
}
