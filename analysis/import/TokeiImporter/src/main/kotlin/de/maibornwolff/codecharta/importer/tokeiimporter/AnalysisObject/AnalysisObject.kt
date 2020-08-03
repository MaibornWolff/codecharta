package de.maibornwolff.codecharta.importer.tokeiimporter.AnalysisObject

class AnalysisObject(
    val blanks: Int,
    val code: Int,
    val comments: Int,
    val lines: Int,
    val stats: List<AnalysisObject>?,
    private val inaccurate: Boolean,
    val name: String?
) {
    fun hasChildren(): Boolean {
        return !stats.isNullOrEmpty()
    }
}
