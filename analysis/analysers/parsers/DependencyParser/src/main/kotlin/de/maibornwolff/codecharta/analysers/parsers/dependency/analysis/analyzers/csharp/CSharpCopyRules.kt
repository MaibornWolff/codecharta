package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.csharp

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.CopyRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DeclaringCopy
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FilePath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NearestCopy

/**
 * Decision 2 of `csharp.md`: one project cannot declare a type twice, so a use points at every file of the nearest
 * project that declares the path, the parts of a partial type or the one copy of that project. The nearest project is
 * the using file's own when it declares the path, else the project of the nearest copy. A `file` type of the using
 * file hides every other copy there.
 */
internal class CSharpCopyRules(private val projects: CSharpProjects) : CopyRules {
    override fun filesFor(copies: List<DeclaringCopy>, usingFile: FilePath): List<FilePath> {
        if (copies.any { it.isFileScoped && it.file == usingFile }) return listOf(usingFile)
        val files = copies.map { it.file }
        val inOwnProject = files.filter { projects.projectOf(it) == projects.projectOf(usingFile) }
        if (inOwnProject.isNotEmpty()) return inOwnProject
        val nearestProject = projects.projectOf(NearestCopy.filesFor(copies, usingFile).first())
        return files.filter { projects.projectOf(it) == nearestProject }
    }
}
