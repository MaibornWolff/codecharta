package de.maibornwolff.codecharta.importer.tokeiimporter.analysisObject

class AnalysisObjectTwelve(
    val blanks: Int,
    val code: Int,
    val comments: Int,
    val reports: List<Report>,
    val children: Children,
    private val inaccurate: Boolean
) {
    fun hasChildren(): Boolean {
        return !reports.isNullOrEmpty()
    }
}

class Report(val stats: Stats, val name: String)

class Stats(val blanks: Int, val code: Int, val comments: Int, val blobs: Blob)

class Blob(val blanks: Int?, val code: Int?, val comments: Int?, val blobs: Blob?)

class Children(val tmp: List<Report>)
