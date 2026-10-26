package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.cpp

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_ALIAS_SEGMENT
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_FORWARD_DECLARATION_SEGMENT
import de.maibornwolff.treesitter.excavationsite.api.DependencyResult

/**
 * The node path of a declaration path: its path, except for a declaration of the global namespace, whose node path
 * starts with the file that declares its body, the first of the include closure of [file], else the nearest.
 */
internal class CppTargets(private val file: List<String>, private val project: CppDeclarations?, result: DependencyResult) {
    private val ownBodies = result.declarations
        .filter { it.parentPath.firstOrNull() !in MARKERS }
        .mapTo(HashSet()) { it.parentPath + it.name }

    fun ownPathOf(path: List<String>): List<String> = if (isGlobal(path)) file + path else path

    fun targetPathOf(path: List<String>): List<String>? {
        if (!isGlobal(path)) return path
        return bodyFileOf(path)?.let { it + path }
    }

    private fun bodyFileOf(path: List<String>): List<String>? {
        if (project == null) return file.takeIf { path in ownBodies }
        return project.bodyFilesInClosure(file, path).firstOrNull() ?: nearest(project.bodyFilesOf(path))
    }

    private fun nearest(files: List<List<String>>): List<String>? = files.maxByOrNull { sharedFolderCount(it) }

    private fun sharedFolderCount(other: List<String>): Int =
        other.dropLast(1).zip(file.dropLast(1)).takeWhile { (first, second) -> first == second }.size

    private fun isGlobal(path: List<String>): Boolean = path.size == 1

    companion object {
        private val MARKERS = setOf(TSE_FORWARD_DECLARATION_SEGMENT, TSE_ALIAS_SEGMENT)
    }
}
