package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vba

/**
 * The Access queries of a run (`vba.md`, Access queries): a `.sql` file in a folder named `queries`, as the export
 * tools write one per query, is the query named after its file. Its name compares as SQL compares an unquoted name, in
 * lower case.
 */
internal object AccessQueryFiles {
    private const val QUERY_FOLDER = "queries"
    private const val SQL_SUFFIX = ".sql"
    private val SEPARATORS = charArrayOf('/', '\\')

    fun isQueryFile(file: String): Boolean {
        val segments = file.split(*SEPARATORS)
        return segments.size > 1 &&
            segments[segments.size - 2].equals(QUERY_FOLDER, ignoreCase = true) &&
            segments.last().endsWith(SQL_SUFFIX, ignoreCase = true)
    }

    fun queryNameOf(file: String): String = file.split(*SEPARATORS).last().dropLast(SQL_SUFFIX.length).lowercase()
}
