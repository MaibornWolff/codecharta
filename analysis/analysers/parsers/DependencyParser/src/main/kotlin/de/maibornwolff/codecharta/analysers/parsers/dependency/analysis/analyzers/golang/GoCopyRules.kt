package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.CopyRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DeclaringCopy
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FilePath

/**
 * Decision 3 of `go.md`: the logical path is the package's folder, so the files that declare one path are build-tag
 * variants of one package, of which each platform compiles one; a use points at every one of them.
 */
internal object GoCopyRules : CopyRules {
    override fun filesFor(copies: List<DeclaringCopy>, usingFile: FilePath): List<FilePath> = copies.map { it.file }
}
