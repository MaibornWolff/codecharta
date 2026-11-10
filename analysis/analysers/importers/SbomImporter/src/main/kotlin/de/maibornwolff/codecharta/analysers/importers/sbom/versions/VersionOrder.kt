package de.maibornwolff.codecharta.analysers.importers.sbom.versions

/**
 * Orders version strings of any ecosystem well enough to tell older from newer: numbers compare as numbers, text
 * as text, and a version ends before its pre-release (`2.0.0-rc.1` < `2.0.0` < `2.0.1`).
 */
object VersionOrder : Comparator<String> {
    private val TOKEN = Regex("""\d+|[A-Za-z]+""")

    override fun compare(first: String, second: String): Int {
        val firstTokens = tokens(first)
        val secondTokens = tokens(second)
        for (index in 0 until maxOf(firstTokens.size, secondTokens.size)) {
            val comparison = compareTokens(firstTokens.getOrNull(index), secondTokens.getOrNull(index))
            if (comparison != 0) return comparison
        }
        return 0
    }

    private fun tokens(version: String): List<String> = TOKEN.findAll(version.removePrefix("v")).map { it.value }.toList()

    // A missing token after the shared part is a release if the other side goes on with text (a pre-release
    // marker), and an older release if the other side goes on with a number (`1.2` < `1.2.1`)
    private fun compareTokens(first: String?, second: String?): Int = when {
        first == null && second == null -> 0
        first == null -> if (second!!.isNumber()) -1 else 1
        second == null -> if (first.isNumber()) 1 else -1
        first.isNumber() && second.isNumber() -> first.toBigInteger().compareTo(second.toBigInteger())
        first.isNumber() -> 1
        second.isNumber() -> -1
        else -> first.lowercase().compareTo(second.lowercase())
    }

    private fun String.isNumber(): Boolean = first().isDigit()
}
