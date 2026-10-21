package de.maibornwolff.codecharta.analysers.parsers.dependency.processing

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node

/**
 * The files that declare each logical path, in scan order. A dependency on a path declared in several files goes to
 * the file that shares the longest folder path with the using file, the first of equally near ones; for SQL it goes
 * to the latest migration in [NaturalPathOrder], wherever it lies.
 */
internal class DeclaringFiles private constructor(
    private val filesByLogicalPath: Map<String, List<FilePath>>,
    private val latestWins: Set<String>
) {
    fun fileFor(logicalPath: String, usingFile: FilePath): FilePath? {
        val files = filesByLogicalPath[logicalPath] ?: return null
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
            val filesByLogicalPath = LinkedHashMap<String, MutableList<FilePath>>()
            val latestWins = HashSet<String>()
            resolvedNodes.forEach { node ->
                val logicalPath = node.pathWithName.withDots()
                val files = filesByLogicalPath.getOrPut(logicalPath) { mutableListOf() }
                FilePath.of(node).let { if (it !in files) files.add(it) }
                if (node.language.laterDefinitionReplacesEarlier) latestWins.add(logicalPath)
            }
            return DeclaringFiles(filesByLogicalPath, latestWins)
        }
    }
}
