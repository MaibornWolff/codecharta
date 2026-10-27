package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.CopyRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DeclaringCopy
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FilePath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NearestCopy

/**
 * "Which file" of `rust.md`: an implementation part, the one file-scoped copy Rust has, is the target only where no
 * declaration of its path is; otherwise the nearest copy.
 */
internal object RustCopyRules : CopyRules {
    override fun filesFor(copies: List<DeclaringCopy>, usingFile: FilePath): List<FilePath> =
        NearestCopy.filesFor(copies.filterNot { it.isFileScoped }.ifEmpty { copies }, usingFile)
}
