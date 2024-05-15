package de.maibornwolff.codecharta.importer.tokeiimporter.analysisObject

class AnalysisObject(
    val blanks: Int,
    val code: Int,
    val comments: Int,
    val lines: Int,
    val stats: List<Stats>?,
    private val inaccurate: Boolean
) {
    fun hasChildren(): Boolean {
        return !stats.isNullOrEmpty()
    }
}

class Stats(
    val blanks: Int,
    val code: Int,
    val comments: Int,
    val lines: Int,
    val name: String
)
