package de.maibornwolff.codecharta.analysers.parsers.dependency.processing

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage

/**
 * The files that declare each logical path, in scan order, with the name scope of their language. A dependency on a
 * path declared in several files goes to a file of the using file's name scope, the one that shares the longest folder
 * path with the using file, the first of equally near ones; for SQL it goes to the latest migration in
 * [NaturalPathOrder], wherever it lies.
 */
internal class DeclaringFiles private constructor(
    private val filesByLogicalPath: Map<String, List<Pair<FilePath, SupportedLanguage>>>,
    private val latestWins: Set<String>
) {
    fun fileFor(logicalPath: String, usingFile: FilePath, usingLanguage: SupportedLanguage): FilePath? {
        val files = filesByLogicalPath[logicalPath]
            .orEmpty()
            .filter { (_, nameScope) -> nameScope == usingLanguage.nameScope }
            .map { (file, _) -> file }
        if (files.isEmpty()) return null
        if (logicalPath in latestWins) return files.maxWith { first, second -> NaturalPathOrder.compare(first.segments, second.segments) }
        return files.maxBy { sharedFolderCount(it, usingFile) }
    }

    private fun sharedFolderCount(declaringFile: FilePath, usingFile: FilePath): Int = declaringFile.segments
        .dropLast(1)
        .zip(usingFile.segments.dropLast(1))
        .takeWhile { (first, second) -> first == second }
        .size

    companion object {
        fun of(resolvedNodes: Collection<Node>): DeclaringFiles {
            val filesByLogicalPath = LinkedHashMap<String, MutableList<Pair<FilePath, SupportedLanguage>>>()
            val latestWins = HashSet<String>()
            resolvedNodes.forEach { node ->
                val logicalPath = node.pathWithName.withDots()
                val files = filesByLogicalPath.getOrPut(logicalPath) { mutableListOf() }
                (FilePath.of(node) to node.language.nameScope).let { if (it !in files) files.add(it) }
                if (node.language.laterDefinitionReplacesEarlier) latestWins.add(logicalPath)
            }
            return DeclaringFiles(filesByLogicalPath, latestWins)
        }
    }
}
