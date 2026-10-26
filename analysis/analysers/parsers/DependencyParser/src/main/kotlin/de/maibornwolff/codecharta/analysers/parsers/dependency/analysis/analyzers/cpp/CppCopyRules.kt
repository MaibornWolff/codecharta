package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.cpp

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.CopyRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DeclaringCopy
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FilePath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NearestCopy

/**
 * "Which file" of `cpp.md`: a use points at the copy the include closure of the using file holds, the first in include
 * order of several; without one in the closure, or without an analysis root to read includes below, the nearest. An
 * implementation part, the one file-scoped copy C++ has, is the target only where no class body is.
 */
internal class CppCopyRules(private val includes: CppIncludes?) : CopyRules {
    override fun filesFor(allCopies: List<DeclaringCopy>, usingFile: FilePath): List<FilePath> {
        val copies = allCopies.filterNot { it.isFileScoped }.ifEmpty { allCopies }
        val closure = includes?.closureOf(usingFile.segments) ?: return NearestCopy.filesFor(copies, usingFile)
        val copyFiles = copies.mapTo(HashSet()) { it.file.segments }
        val firstIncluded = closure.firstOrNull { it in copyFiles } ?: return NearestCopy.filesFor(copies, usingFile)
        return listOf(FilePath(firstIncluded))
    }
}
