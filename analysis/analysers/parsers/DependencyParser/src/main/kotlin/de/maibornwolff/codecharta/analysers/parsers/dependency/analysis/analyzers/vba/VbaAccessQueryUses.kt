package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vba

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common.splitNameToParts
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FilePath
import de.maibornwolff.treesitter.excavationsite.api.AccessQuery
import de.maibornwolff.treesitter.excavationsite.api.SqlName
import de.maibornwolff.treesitter.excavationsite.api.SqlNameKind
import de.maibornwolff.treesitter.excavationsite.api.VbaName
import de.maibornwolff.treesitter.excavationsite.api.VbaNameKind

/**
 * What an Access query uses of the VBA modules of its run (`vba.md`, Access queries): the code module of each form and
 * report it names, and the public VBA function a call means that names no SQL routine, looked up from the query's file.
 */
internal class VbaAccessQueryUses private constructor(private val lookup: VbaLookup?) {
    /** The logical paths [query] uses; [isUnresolvedInSql] tells the calls that no SQL routine of the run declares. */
    fun of(query: AccessQuery, isUnresolvedInSql: (SqlName) -> Boolean): List<List<String>> {
        if (lookup == null) return emptyList()
        val calls = query.names.filter { it.kind == SqlNameKind.ROUTINE && it.parts.size == 1 && isUnresolvedInSql(it) }
        val names = query.forms.map { VbaName(listOf(it), VbaNameKind.FORM) } +
            query.reports.map { VbaName(listOf(it), VbaNameKind.REPORT) } +
            calls.map { VbaName(it.parts) }
        return names.mapNotNull { lookup.resolve(it) }.distinct()
    }

    companion object {
        /** The uses of the queries of the run of [fileInfo]; none for a file analysed without a root. */
        fun of(fileInfo: FileInfo): VbaAccessQueryUses {
            val root = fileInfo.analysisRoot ?: return VbaAccessQueryUses(null)
            val usingFile = FilePath(splitNameToParts(fileInfo.physicalPath))
            return VbaAccessQueryUses(VbaLookup(VbaProject.of(root, fileInfo.analysedFiles), null, usingFile))
        }
    }
}
