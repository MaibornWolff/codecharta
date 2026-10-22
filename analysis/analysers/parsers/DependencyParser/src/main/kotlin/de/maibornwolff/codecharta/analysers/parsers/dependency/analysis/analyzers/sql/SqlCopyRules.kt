package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.sql

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.CopyRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FilePath

/** Migrations create an object again in a later file to change it, so the latest migration holds its current definition. */
internal object SqlCopyRules : CopyRules {
    override fun filesFor(declaringFiles: List<FilePath>, usingFile: FilePath): List<FilePath> =
        listOf(declaringFiles.maxWith { first, second -> NaturalPathOrder.compare(first.segments, second.segments) })
}
