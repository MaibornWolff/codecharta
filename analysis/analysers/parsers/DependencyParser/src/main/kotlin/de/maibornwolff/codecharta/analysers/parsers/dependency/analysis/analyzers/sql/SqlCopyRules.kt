package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.sql

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.CopyRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DeclaringCopy
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FilePath

/**
 * "Which file" of `sql.md`: a declaration before an implementation part, the file-scoped copy only its own file sees,
 * the declaration the using file makes itself, and of several others the latest migration, as migrations create an
 * object again in a later file to change it (decision 15).
 */
internal object SqlCopyRules : CopyRules {
    override fun filesFor(copies: List<DeclaringCopy>, usingFile: FilePath): List<FilePath> {
        val files = copies.filterNot { it.isFileScoped }.ifEmpty { copies }.map { it.file }
        return listOf(files.find { it == usingFile } ?: latestOf(files))
    }

    private fun latestOf(files: List<FilePath>): FilePath =
        files.maxWith { first, second -> NaturalPathOrder.compare(first.segments, second.segments) }
}
