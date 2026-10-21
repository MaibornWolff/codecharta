package de.maibornwolff.codecharta.analysers.parsers.dependency.processing

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage

/**
 * The files that declare each logical path, in scan order, with the name scope of their language. A dependency on a
 * path declared in several files goes to a file of the using file's name scope, the one that shares the longest folder
 * path with the using file, the first of equally near ones; for SQL it goes to the latest migration in
 * [NaturalPathOrder], wherever it lies, and for a language that does not point at the nearest copy to the first file.
 */
internal class DeclaringFiles private constructor(private val filesByLogicalPath: Map<String, List<Pair<FilePath, SupportedLanguage>>>) {
    fun fileFor(logicalPath: String, usingFile: FilePath, usingLanguage: SupportedLanguage): FilePath? {
        val files = filesByLogicalPath[logicalPath]
            .orEmpty()
            .filter { (_, nameScope) -> nameScope == usingLanguage.nameScope }
            .map { (file, _) -> file }
        return when {
            files.isEmpty() -> null
            usingLanguage.laterDefinitionReplacesEarlier -> files.maxWith {
                first,
                second
                ->
                NaturalPathOrder.compare(first.segments, second.segments)
            }
            !usingLanguage.pointsAtNearestCopy -> files.first()
            else -> files.maxBy { sharedFolderCount(it, usingFile) }
        }
    }

    private fun sharedFolderCount(declaringFile: FilePath, usingFile: FilePath): Int = declaringFile.segments
        .dropLast(1)
        .zip(usingFile.segments.dropLast(1))
        .takeWhile { (first, second) -> first == second }
        .size

    companion object {
        fun of(resolvedNodes: Collection<Node>): DeclaringFiles {
            val filesByLogicalPath = LinkedHashMap<String, MutableList<Pair<FilePath, SupportedLanguage>>>()
            resolvedNodes.forEach { node ->
                val files = filesByLogicalPath.getOrPut(node.pathWithName.withDots()) { mutableListOf() }
                (FilePath.of(node) to node.language.nameScope).let { if (it !in files) files.add(it) }
            }
            return DeclaringFiles(filesByLogicalPath)
        }
    }
}
