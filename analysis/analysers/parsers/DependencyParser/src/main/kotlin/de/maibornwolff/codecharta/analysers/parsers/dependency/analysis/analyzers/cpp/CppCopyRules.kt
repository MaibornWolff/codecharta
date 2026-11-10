package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.cpp

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.CopyRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DeclaringCopy
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FilePath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.nearestCopy

/**
 * "Which file" of `cpp.md`: a use points at the copy the include closure of the using file holds, the first in include
 * order of several; without one in the closure, or without an analysis root to read includes below, the nearest. An
 * implementation part, the one file-scoped copy C++ has, is the target only where no class body is.
 */
internal class CppCopyRules(private val includes: CppIncludes?) : CopyRules {
    override fun filesFor(copies: List<DeclaringCopy>, usingFile: FilePath): List<FilePath> {
        val candidates = copies.filterNot { it.isFileScoped }.ifEmpty { copies }
        val closure = includes?.closureOf(usingFile.segments) ?: return nearestCopy.filesFor(candidates, usingFile)
        val candidateFiles = candidates.mapTo(HashSet()) { it.file.segments }
        val firstIncluded = closure.firstOrNull { it in candidateFiles } ?: return nearestCopy.filesFor(candidates, usingFile)
        return listOf(FilePath(firstIncluded))
    }
}
