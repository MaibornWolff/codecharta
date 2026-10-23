package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.sql

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.CopyRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DeclaringCopy
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FilePath

/** Migrations create an object again in a later file to change it, so the latest migration holds its current definition. */
internal object SqlCopyRules : CopyRules {
    override fun filesFor(copies: List<DeclaringCopy>, usingFile: FilePath): List<FilePath> =
        listOf(copies.map { it.file }.maxWith { first, second -> NaturalPathOrder.compare(first.segments, second.segments) })
}
